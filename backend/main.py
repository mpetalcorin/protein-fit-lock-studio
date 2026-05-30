from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from Bio.PDB import PDBParser, MMCIFParser
from scipy.spatial import cKDTree
import numpy as np
import tempfile
import os
from typing import Dict, List, Tuple

app = FastAPI(
    title="Protein Fit Lock Studio API",
    description="Advanced protein interface analysis for estimating whether two chains fit together well.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HYDROPHOBIC_RESIDUES = {"ALA", "VAL", "LEU", "ILE", "MET", "PHE", "TRP", "PRO", "TYR"}
POLAR_RESIDUES = {"SER", "THR", "ASN", "GLN", "CYS"}
POSITIVE_RESIDUES = {"LYS", "ARG", "HIS"}
NEGATIVE_RESIDUES = {"ASP", "GLU"}
CHARGED_RESIDUES = POSITIVE_RESIDUES | NEGATIVE_RESIDUES
AROMATIC_RESIDUES = {"PHE", "TYR", "TRP", "HIS"}

HBOND_DONOR_ACCEPTOR_ELEMENTS = {"N", "O", "S"}

VDW_RADII = {
    "C": 1.70,
    "N": 1.55,
    "O": 1.52,
    "S": 1.80,
    "P": 1.80,
    "F": 1.47,
    "CL": 1.75,
    "BR": 1.85,
    "I": 1.98,
}

def parse_structure(file_path: str, filename: str):
    filename_lower = filename.lower()
    if filename_lower.endswith(".cif") or filename_lower.endswith(".mmcif"):
        parser = MMCIFParser(QUIET=True)
    else:
        parser = PDBParser(QUIET=True)
    return parser.get_structure("uploaded_structure", file_path)

def get_chain_atoms(structure) -> Dict[str, List[dict]]:
    chains = {}
    for model in structure:
        for chain in model:
            chain_id = chain.id
            atoms = []
            for residue in chain:
                resname = residue.get_resname()
                resid = residue.id[1]
                icode = residue.id[2].strip()
                for atom in residue:
                    element = (atom.element or atom.get_name()[0]).upper()
                    if element != "H":
                        coord = atom.get_coord()
                        atoms.append({
                            "atom_name": atom.get_name(),
                            "resname": resname,
                            "resid": resid,
                            "icode": icode,
                            "chain": chain_id,
                            "coord": coord.astype(float),
                            "element": element,
                        })
            if atoms:
                chains[chain_id] = atoms
        break
    return chains

def coords_from_atoms(atoms: List[dict]) -> np.ndarray:
    return np.array([a["coord"] for a in atoms], dtype=float)

def residue_label(atom: dict) -> str:
    suffix = atom["icode"] if atom.get("icode") else ""
    return f"{atom['chain']}:{atom['resname']}{atom['resid']}{suffix}"

def atom_label(atom: dict) -> str:
    return f"{residue_label(atom)}:{atom['atom_name']}"

def distance(a, b) -> float:
    return float(np.linalg.norm(a - b))

def interface_atoms(atoms_a, atoms_b, cutoff=5.0):
    coords_a = coords_from_atoms(atoms_a)
    coords_b = coords_from_atoms(atoms_b)
    tree_b = cKDTree(coords_b)
    pairs = tree_b.query_ball_point(coords_a, cutoff)

    idx_a = set()
    idx_b = set()
    contact_pairs = []

    for i, near_indices in enumerate(pairs):
        for j in near_indices:
            d = distance(coords_a[i], coords_b[j])
            idx_a.add(i)
            idx_b.add(j)
            contact_pairs.append((i, j, d))

    return sorted(idx_a), sorted(idx_b), contact_pairs

def approximate_shape_complementarity(atoms_a, atoms_b, contact_pairs):
    if not contact_pairs:
        return 0.0

    coords_a_all = coords_from_atoms(atoms_a)
    coords_b_all = coords_from_atoms(atoms_b)
    centroid_a = np.mean(coords_a_all, axis=0)
    centroid_b = np.mean(coords_b_all, axis=0)

    scores = []

    for i, j, d in contact_pairs:
        pa = atoms_a[i]["coord"]
        pb = atoms_b[j]["coord"]

        na = pa - centroid_a
        nb = pb - centroid_b

        na = na / (np.linalg.norm(na) + 1e-8)
        nb = nb / (np.linalg.norm(nb) + 1e-8)

        dot = float(np.dot(na, nb))
        normal_match = (1.0 - dot) / 2.0

        if d < 2.2:
            distance_weight = 0.20
        elif 2.2 <= d <= 4.5:
            distance_weight = 1.00
        elif 4.5 < d <= 6.0:
            distance_weight = 0.60
        else:
            distance_weight = 0.10

        scores.append(normal_match * distance_weight)

    return float(max(0.0, min(1.0, np.mean(scores))))

def classify_score(score: float, clashes: int, contact_count: int) -> Tuple[str, str]:
    if contact_count < 20:
        return (
            "Weak or uncertain interface",
            "There are too few close contacts to confidently say that these chains form a strong interface."
        )

    if clashes > 20:
        return (
            "Poor fit with steric clashes",
            "The proteins appear to collide too much, like a key that is too large for the lock."
        )

    if score >= 0.68:
        return (
            "Excellent lock-and-key fit",
            "The two surfaces appear to pack together very well, similar to a well-designed antibody-antigen interface."
        )
    elif score >= 0.60:
        return (
            "Good fit",
            "The interface has promising geometric packing. The two surfaces appear reasonably complementary."
        )
    elif score >= 0.50:
        return (
            "Moderate fit",
            "The proteins touch each other, but the surface match may need improvement."
        )
    else:
        return (
            "Weak fit",
            "The surfaces do not appear to match very well. This may need redesign or further structural refinement."
        )

def atom_vdw_radius(atom):
    element = atom.get("element", "").upper()
    return VDW_RADII.get(element, 1.70)

def detect_salt_bridges(atoms_a, atoms_b, contact_pairs):
    bridges = []
    seen = set()

    for i, j, d in contact_pairs:
        a = atoms_a[i]
        b = atoms_b[j]

        opposite_charge = (
            (a["resname"] in POSITIVE_RESIDUES and b["resname"] in NEGATIVE_RESIDUES) or
            (a["resname"] in NEGATIVE_RESIDUES and b["resname"] in POSITIVE_RESIDUES)
        )

        if opposite_charge and d <= 4.0:
            key = tuple(sorted([residue_label(a), residue_label(b)]))
            if key not in seen:
                bridges.append({
                    "chain_a_residue": residue_label(a),
                    "chain_b_residue": residue_label(b),
                    "distance_A": round(d, 2),
                })
                seen.add(key)

    return bridges[:50]

def detect_hbond_like_contacts(atoms_a, atoms_b, contact_pairs):
    hbonds = []
    seen = set()

    for i, j, d in contact_pairs:
        a = atoms_a[i]
        b = atoms_b[j]

        if (
            a["element"] in HBOND_DONOR_ACCEPTOR_ELEMENTS and
            b["element"] in HBOND_DONOR_ACCEPTOR_ELEMENTS and
            2.4 <= d <= 3.6
        ):
            key = tuple(sorted([atom_label(a), atom_label(b)]))
            if key not in seen:
                hbonds.append({
                    "chain_a_atom": atom_label(a),
                    "chain_b_atom": atom_label(b),
                    "distance_A": round(d, 2),
                })
                seen.add(key)

    return hbonds[:80]

def detect_aromatic_contacts(atoms_a, atoms_b, contact_pairs):
    aromatic = []
    seen = set()

    for i, j, d in contact_pairs:
        a = atoms_a[i]
        b = atoms_b[j]

        if a["resname"] in AROMATIC_RESIDUES and b["resname"] in AROMATIC_RESIDUES and d <= 5.5:
            key = tuple(sorted([residue_label(a), residue_label(b)]))
            if key not in seen:
                aromatic.append({
                    "chain_a_residue": residue_label(a),
                    "chain_b_residue": residue_label(b),
                    "distance_A": round(d, 2),
                })
                seen.add(key)

    return aromatic[:50]

def detect_vdw_clashes(atoms_a, atoms_b, contact_pairs):
    clashes = []

    for i, j, d in contact_pairs:
        a = atoms_a[i]
        b = atoms_b[j]
        expected = atom_vdw_radius(a) + atom_vdw_radius(b)
        overlap = expected - d

        if overlap > 0.65:
            clashes.append({
                "chain_a_atom": atom_label(a),
                "chain_b_atom": atom_label(b),
                "distance_A": round(d, 2),
                "vdw_overlap_A": round(overlap, 2),
            })

    clashes.sort(key=lambda x: x["vdw_overlap_A"], reverse=True)
    return clashes[:80]

def residue_contact_counts(atoms_a, atoms_b, contact_pairs):
    counts = {}

    for i, j, d in contact_pairs:
        ra = residue_label(atoms_a[i])
        rb = residue_label(atoms_b[j])
        counts[ra] = counts.get(ra, 0) + 1
        counts[rb] = counts.get(rb, 0) + 1

    ranked = sorted(counts.items(), key=lambda x: x[1], reverse=True)
    return [{"residue": r, "contact_count": c} for r, c in ranked[:60]]

def contact_distance_histogram(contact_pairs):
    bins = {
        "2.0-2.5 Å": 0,
        "2.5-3.0 Å": 0,
        "3.0-3.5 Å": 0,
        "3.5-4.0 Å": 0,
        "4.0-4.5 Å": 0,
        "4.5-5.0 Å": 0,
    }

    for _, _, d in contact_pairs:
        if 2.0 <= d < 2.5:
            bins["2.0-2.5 Å"] += 1
        elif 2.5 <= d < 3.0:
            bins["2.5-3.0 Å"] += 1
        elif 3.0 <= d < 3.5:
            bins["3.0-3.5 Å"] += 1
        elif 3.5 <= d < 4.0:
            bins["3.5-4.0 Å"] += 1
        elif 4.0 <= d < 4.5:
            bins["4.0-4.5 Å"] += 1
        elif 4.5 <= d <= 5.0:
            bins["4.5-5.0 Å"] += 1

    return [{"bin": k, "count": v} for k, v in bins.items()]

def estimate_interface_density(interface_residue_count_a, interface_residue_count_b, contact_count):
    total_residues = max(1, interface_residue_count_a + interface_residue_count_b)
    return float(contact_count / total_residues)

def estimate_packing_efficiency(contact_count_4, contact_count_5):
    if contact_count_5 == 0:
        return 0.0
    return float(contact_count_4 / contact_count_5)

def estimate_designability_score(sc_score, packing_efficiency, clash_count, hbond_count, salt_bridge_count, aromatic_count):
    clash_penalty = min(0.35, clash_count / 100)
    chemistry_bonus = min(0.20, (hbond_count * 0.006) + (salt_bridge_count * 0.015) + (aromatic_count * 0.008))
    score = (0.60 * sc_score) + (0.25 * packing_efficiency) + chemistry_bonus - clash_penalty
    return float(max(0.0, min(1.0, score)))

def build_risk_flags(sc_score, clash_count, salt_count, hbond_count, aromatic_count, packing_efficiency, contact_count):
    flags = []

    if contact_count < 50:
        flags.append({
            "level": "high",
            "title": "Sparse interface",
            "message": "The chains have relatively few close contacts, suggesting weak or uncertain binding."
        })

    if clash_count > 20:
        flags.append({
            "level": "high",
            "title": "Steric clash burden",
            "message": "Many atoms are too close together, suggesting an unrealistic or strained interface."
        })

    if sc_score < 0.5:
        flags.append({
            "level": "medium",
            "title": "Poor geometric complementarity",
            "message": "The molecular surfaces may not fit together well."
        })

    if packing_efficiency < 0.35 and contact_count >= 50:
        flags.append({
            "level": "medium",
            "title": "Loose packing",
            "message": "Many contacts are relatively distant, suggesting the interface may not be tightly packed."
        })

    if hbond_count < 5 and salt_count < 2:
        flags.append({
            "level": "low",
            "title": "Limited polar network",
            "message": "Few hydrogen-bond-like or salt-bridge-like contacts were detected."
        })

    if aromatic_count >= 5:
        flags.append({
            "level": "positive",
            "title": "Aromatic interface support",
            "message": "Aromatic residues may contribute to interface packing or recognition."
        })

    if not flags:
        flags.append({
            "level": "positive",
            "title": "Balanced interface",
            "message": "No major red flags were detected by the approximate structural analysis."
        })

    return flags

def build_design_recommendations(sc_score, clash_count, hbond_count, salt_count, hydrophobic_count, aromatic_count, packing_efficiency):
    recommendations = []

    if clash_count > 20:
        recommendations.append("Run side-chain repacking or energy minimisation to reduce steric clashes.")
    if sc_score < 0.5:
        recommendations.append("Try alternative docking poses or redesign the interface geometry.")
    if packing_efficiency < 0.35:
        recommendations.append("Improve close-contact packing by redesigning residues at shallow or loose interface regions.")
    if hbond_count < 5:
        recommendations.append("Inspect whether additional hydrogen bonds can be introduced without creating buried unsatisfied polar atoms.")
    if salt_count < 2:
        recommendations.append("Consider whether complementary charged residues could improve specificity at the interface edge.")
    if hydrophobic_count < 10:
        recommendations.append("Strengthen the hydrophobic core of the interface if the biological context permits.")
    if aromatic_count > 8:
        recommendations.append("Check aromatic clusters for useful pi-packing, but verify that they do not create excessive rigidity.")

    if not recommendations:
        recommendations.append("The interface looks promising. Continue with electrostatics, binding energy, MD stability, and experimental validation.")

    return recommendations

def analyze_interface(chains, chain_a: str, chain_b: str):
    if chain_a not in chains or chain_b not in chains:
        raise ValueError("Selected chains were not found in the structure.")

    atoms_a = chains[chain_a]
    atoms_b = chains[chain_b]

    idx_a, idx_b, contact_pairs_5 = interface_atoms(atoms_a, atoms_b, cutoff=5.0)
    _, _, close_pairs_4 = interface_atoms(atoms_a, atoms_b, cutoff=4.0)
    _, _, close_pairs_3_6 = interface_atoms(atoms_a, atoms_b, cutoff=3.6)
    _, _, raw_clash_pairs = interface_atoms(atoms_a, atoms_b, cutoff=2.2)

    sc_score = approximate_shape_complementarity(atoms_a, atoms_b, contact_pairs_5)

    interface_residues_a = sorted(set(residue_label(atoms_a[i]) for i in idx_a))
    interface_residues_b = sorted(set(residue_label(atoms_b[i]) for i in idx_b))

    hydrophobic_contacts = 0
    polar_or_charged_contacts = 0

    for i, j, d in contact_pairs_5:
        ra = atoms_a[i]["resname"]
        rb = atoms_b[j]["resname"]

        if ra in HYDROPHOBIC_RESIDUES and rb in HYDROPHOBIC_RESIDUES:
            hydrophobic_contacts += 1

        if (
            ra in POLAR_RESIDUES or rb in POLAR_RESIDUES or
            ra in CHARGED_RESIDUES or rb in CHARGED_RESIDUES
        ):
            polar_or_charged_contacts += 1

    salt_bridges = detect_salt_bridges(atoms_a, atoms_b, contact_pairs_5)
    hbond_like_contacts = detect_hbond_like_contacts(atoms_a, atoms_b, contact_pairs_5)
    aromatic_contacts = detect_aromatic_contacts(atoms_a, atoms_b, contact_pairs_5)
    vdw_clashes = detect_vdw_clashes(atoms_a, atoms_b, contact_pairs_5)
    residue_hotspots = residue_contact_counts(atoms_a, atoms_b, contact_pairs_5)
    histogram = contact_distance_histogram(contact_pairs_5)

    contact_distances = [d for _, _, d in contact_pairs_5]
    mean_distance = float(np.mean(contact_distances)) if contact_distances else None
    median_distance = float(np.median(contact_distances)) if contact_distances else None
    min_distance = float(np.min(contact_distances)) if contact_distances else None

    interface_density = estimate_interface_density(
        len(interface_residues_a),
        len(interface_residues_b),
        len(contact_pairs_5)
    )

    packing_efficiency = estimate_packing_efficiency(len(close_pairs_4), len(contact_pairs_5))

    designability_score = estimate_designability_score(
        sc_score=sc_score,
        packing_efficiency=packing_efficiency,
        clash_count=len(vdw_clashes),
        hbond_count=len(hbond_like_contacts),
        salt_bridge_count=len(salt_bridges),
        aromatic_count=len(aromatic_contacts),
    )

    title, explanation = classify_score(
        sc_score,
        clashes=len(vdw_clashes),
        contact_count=len(contact_pairs_5)
    )

    risk_flags = build_risk_flags(
        sc_score=sc_score,
        clash_count=len(vdw_clashes),
        salt_count=len(salt_bridges),
        hbond_count=len(hbond_like_contacts),
        aromatic_count=len(aromatic_contacts),
        packing_efficiency=packing_efficiency,
        contact_count=len(contact_pairs_5)
    )

    suggested_action = build_design_recommendations(
        sc_score=sc_score,
        clash_count=len(vdw_clashes),
        hbond_count=len(hbond_like_contacts),
        salt_count=len(salt_bridges),
        hydrophobic_count=hydrophobic_contacts,
        aromatic_count=len(aromatic_contacts),
        packing_efficiency=packing_efficiency,
    )

    return {
        "chain_a": chain_a,
        "chain_b": chain_b,
        "atom_count_chain_a": len(atoms_a),
        "atom_count_chain_b": len(atoms_b),
        "interface_atom_count_chain_a": len(idx_a),
        "interface_atom_count_chain_b": len(idx_b),
        "interface_residue_count_chain_a": len(interface_residues_a),
        "interface_residue_count_chain_b": len(interface_residues_b),
        "contact_count_5A": len(contact_pairs_5),
        "contact_count_4A": len(close_pairs_4),
        "contact_count_3_6A": len(close_pairs_3_6),
        "raw_clash_count_below_2_2A": len(raw_clash_pairs),
        "clash_count_below_2_2A": len(vdw_clashes),
        "mean_contact_distance_A": mean_distance,
        "median_contact_distance_A": median_distance,
        "minimum_contact_distance_A": min_distance,
        "hydrophobic_contact_count": hydrophobic_contacts,
        "polar_or_charged_contact_count": polar_or_charged_contacts,
        "salt_bridge_count": len(salt_bridges),
        "hbond_like_contact_count": len(hbond_like_contacts),
        "aromatic_contact_count": len(aromatic_contacts),
        "interface_density_contacts_per_residue": round(interface_density, 3),
        "packing_efficiency_4A_over_5A": round(packing_efficiency, 3),
        "approximate_shape_complementarity": round(sc_score, 3),
        "designability_score": round(designability_score, 3),
        "classification": title,
        "layman_explanation": explanation,
        "risk_flags": risk_flags,
        "suggested_actions": suggested_action,
        "salt_bridges": salt_bridges,
        "hbond_like_contacts": hbond_like_contacts[:30],
        "aromatic_contacts": aromatic_contacts,
        "vdw_clashes": vdw_clashes[:30],
        "residue_hotspots": residue_hotspots,
        "contact_distance_histogram": histogram,
        "top_interface_residues_chain_a": interface_residues_a[:40],
        "top_interface_residues_chain_b": interface_residues_b[:40],
        "method_note": "This app uses an approximate SC-like score and heuristic interaction detection. Publication-grade analysis should use molecular surface normals, solvent-accessible surface area, electrostatics, energy functions, and experimental validation."
    }



def all_pairwise_chain_analysis(chains):
    chain_ids = sorted(chains.keys())
    results = []
    for i in range(len(chain_ids)):
        for j in range(i + 1, len(chain_ids)):
            ca = chain_ids[i]
            cb = chain_ids[j]
            try:
                r = analyze_interface(chains, ca, cb)
                results.append({
                    "chain_a": ca,
                    "chain_b": cb,
                    "approximate_shape_complementarity": r["approximate_shape_complementarity"],
                    "designability_score": r["designability_score"],
                    "contact_count_5A": r["contact_count_5A"],
                    "contact_count_4A": r["contact_count_4A"],
                    "clash_count_below_2_2A": r["clash_count_below_2_2A"],
                    "salt_bridge_count": r["salt_bridge_count"],
                    "hbond_like_contact_count": r["hbond_like_contact_count"],
                    "aromatic_contact_count": r["aromatic_contact_count"],
                    "classification": r["classification"],
                })
            except Exception:
                pass

    results.sort(key=lambda x: x["designability_score"], reverse=True)
    return results

def mutation_suggestion_engine(result):
    suggestions = []

    hotspots = result.get("residue_hotspots", [])[:12]
    clashes = result.get("vdw_clashes", [])[:12]
    salt_count = result.get("salt_bridge_count", 0)
    hbond_count = result.get("hbond_like_contact_count", 0)
    hydrophobic_count = result.get("hydrophobic_contact_count", 0)
    packing = result.get("packing_efficiency_4A_over_5A", 0)
    sc = result.get("approximate_shape_complementarity", 0)

    for clash in clashes[:6]:
        suggestions.append({
            "priority": "High",
            "target_region": clash.get("chain_a_atom", "") + " / " + clash.get("chain_b_atom", ""),
            "issue": "Steric clash-like contact",
            "suggestion": "Consider side-chain repacking, rotamer search, or mutation to a smaller residue if biologically acceptable.",
            "reason": f"Detected close contact with estimated van der Waals overlap of {clash.get('vdw_overlap_A', 'NA')} Å."
        })

    if sc < 0.5:
        suggestions.append({
            "priority": "High",
            "target_region": "Global interface",
            "issue": "Weak shape complementarity",
            "suggestion": "Try alternative docking poses, backbone relaxation, or redesign of protruding and poorly packed surface regions.",
            "reason": "The approximate shape-complementarity score is below the desired design threshold."
        })

    if packing < 0.35:
        suggestions.append({
            "priority": "Medium",
            "target_region": "Interface core",
            "issue": "Loose close-contact packing",
            "suggestion": "Inspect hotspot residues and consider mutations that improve side-chain packing without creating clashes.",
            "reason": "The 4 Å over 5 Å packing efficiency is low."
        })

    if hbond_count < 5:
        suggestions.append({
            "priority": "Medium",
            "target_region": "Polar interface edge",
            "issue": "Limited hydrogen-bond-like network",
            "suggestion": "Consider adding polar residues at solvent-exposed interface edges, but avoid buried unsatisfied polar groups.",
            "reason": "Few N/O/S contacts were detected in the hydrogen-bond distance range."
        })

    if salt_count < 2:
        suggestions.append({
            "priority": "Medium",
            "target_region": "Charged interface edge",
            "issue": "Limited salt-bridge-like support",
            "suggestion": "Evaluate whether complementary Lys/Arg/His and Asp/Glu pairs could improve specificity.",
            "reason": "Few opposite-charge close contacts were detected."
        })

    if hydrophobic_count < 10:
        suggestions.append({
            "priority": "Low",
            "target_region": "Hydrophobic interface core",
            "issue": "Weak hydrophobic packing",
            "suggestion": "Consider whether additional hydrophobic side-chain packing could improve buried interface stability.",
            "reason": "The hydrophobic contact count is low relative to the total interface."
        })

    for h in hotspots[:4]:
        suggestions.append({
            "priority": "Review",
            "target_region": h.get("residue", "Interface hotspot"),
            "issue": "High-contact hotspot residue",
            "suggestion": "Inspect this residue carefully before mutation, it may be important for binding energy or specificity.",
            "reason": f"This residue has {h.get('contact_count')} interface contacts."
        })

    if not suggestions:
        suggestions.append({
            "priority": "Review",
            "target_region": "Whole interface",
            "issue": "No obvious redesign trigger",
            "suggestion": "Proceed to electrostatics, buried surface area, binding-energy estimation, and experimental validation.",
            "reason": "The current heuristic analysis did not detect major interface liabilities."
        })

    return suggestions[:20]

@app.get("/")
def root():
    return {"message": "Protein Fit Lock Studio API v2 is running."}

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "Protein Fit Lock Studio API",
        "version": "2.0.0",
        "features": [
            "chain detection",
            "pairwise interface scoring",
            "batch chain-pair ranking",
            "shape-complementarity-like scoring",
            "hydrogen-bond-like contact detection",
            "salt-bridge-like contact detection",
            "aromatic contact detection",
            "clash detection",
            "designability scoring",
            "mutation suggestion engine"
        ]
    }

@app.post("/chains")
async def detect_chains(file: UploadFile = File(...)):
    try:
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        structure = parse_structure(tmp_path, file.filename)
        chains = get_chain_atoms(structure)
        os.remove(tmp_path)

        summary = []
        for cid, atoms in chains.items():
            residues = sorted(set((a["resname"], a["resid"], a.get("icode", "")) for a in atoms))
            summary.append({
                "chain_id": cid,
                "atom_count": len(atoms),
                "residue_count": len(residues)
            })

        return {"chains": summary}

    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    chain_a: str = Form(...),
    chain_b: str = Form(...)
):
    try:
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        structure = parse_structure(tmp_path, file.filename)
        chains = get_chain_atoms(structure)
        result = analyze_interface(chains, chain_a, chain_b)
        os.remove(tmp_path)

        return result

    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

@app.get("/demo")
def demo():
    return {
        "chain_a": "A",
        "chain_b": "B",
        "atom_count_chain_a": 3210,
        "atom_count_chain_b": 2784,
        "interface_atom_count_chain_a": 184,
        "interface_atom_count_chain_b": 171,
        "interface_residue_count_chain_a": 38,
        "interface_residue_count_chain_b": 35,
        "contact_count_5A": 442,
        "contact_count_4A": 219,
        "contact_count_3_6A": 143,
        "raw_clash_count_below_2_2A": 4,
        "clash_count_below_2_2A": 4,
        "mean_contact_distance_A": 3.72,
        "median_contact_distance_A": 3.64,
        "minimum_contact_distance_A": 2.18,
        "hydrophobic_contact_count": 88,
        "polar_or_charged_contact_count": 156,
        "salt_bridge_count": 7,
        "hbond_like_contact_count": 24,
        "aromatic_contact_count": 11,
        "interface_density_contacts_per_residue": 6.055,
        "packing_efficiency_4A_over_5A": 0.495,
        "approximate_shape_complementarity": 0.652,
        "designability_score": 0.711,
        "classification": "Good fit",
        "layman_explanation": "The interface has promising geometric packing. The two surfaces appear reasonably complementary.",
        "risk_flags": [
            {
                "level": "positive",
                "title": "Balanced interface",
                "message": "No major red flags were detected by the approximate structural analysis."
            },
            {
                "level": "positive",
                "title": "Aromatic interface support",
                "message": "Aromatic residues may contribute to interface packing or recognition."
            }
        ],
        "suggested_actions": [
            "The interface looks promising. Continue with electrostatics, binding energy, MD stability, and experimental validation."
        ],
        "salt_bridges": [
            {"chain_a_residue": "A:LYS31", "chain_b_residue": "B:ASP101", "distance_A": 3.1},
            {"chain_a_residue": "A:ARG98", "chain_b_residue": "B:GLU155", "distance_A": 3.4}
        ],
        "hbond_like_contacts": [
            {"chain_a_atom": "A:TYR32:OH", "chain_b_atom": "B:ASN152:OD1", "distance_A": 2.8},
            {"chain_a_atom": "A:SER33:OG", "chain_b_atom": "B:GLU101:OE1", "distance_A": 3.0}
        ],
        "aromatic_contacts": [
            {"chain_a_residue": "A:TRP50", "chain_b_residue": "B:TYR155", "distance_A": 4.7}
        ],
        "vdw_clashes": [
            {"chain_a_atom": "A:ARG98:NH1", "chain_b_atom": "B:GLU155:OE2", "distance_A": 2.18, "vdw_overlap_A": 0.89}
        ],
        "residue_hotspots": [
            {"residue": "A:ARG98", "contact_count": 31},
            {"residue": "B:GLU155", "contact_count": 28},
            {"residue": "A:TRP50", "contact_count": 22},
            {"residue": "B:TYR155", "contact_count": 19}
        ],
        "contact_distance_histogram": [
            {"bin": "2.0-2.5 Å", "count": 4},
            {"bin": "2.5-3.0 Å", "count": 36},
            {"bin": "3.0-3.5 Å", "count": 103},
            {"bin": "3.5-4.0 Å", "count": 76},
            {"bin": "4.0-4.5 Å", "count": 112},
            {"bin": "4.5-5.0 Å", "count": 111}
        ],
        "top_interface_residues_chain_a": [
            "A:TYR32", "A:SER33", "A:TRP50", "A:ASP52", "A:ARG98"
        ],
        "top_interface_residues_chain_b": [
            "B:GLU101", "B:LYS104", "B:PHE150", "B:ASN152", "B:TYR155"
        ],
        "method_note": "Demo result. Real uploads use approximate interface scoring."
    }



@app.post("/batch-analyze")
async def batch_analyze(file: UploadFile = File(...)):
    try:
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        structure = parse_structure(tmp_path, file.filename)
        chains = get_chain_atoms(structure)
        results = all_pairwise_chain_analysis(chains)
        os.remove(tmp_path)

        return {
            "pair_count": len(results),
            "ranked_pairs": results,
            "note": "Pairs are ranked by designability score. Use this to identify the most promising chain-chain interface in multi-chain structures."
        }

    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

@app.post("/mutation-suggestions")
async def mutation_suggestions(
    file: UploadFile = File(...),
    chain_a: str = Form(...),
    chain_b: str = Form(...)
):
    try:
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        structure = parse_structure(tmp_path, file.filename)
        chains = get_chain_atoms(structure)
        result = analyze_interface(chains, chain_a, chain_b)
        suggestions = mutation_suggestion_engine(result)
        os.remove(tmp_path)

        return {
            "chain_a": chain_a,
            "chain_b": chain_b,
            "suggestions": suggestions,
            "note": "These are heuristic redesign suggestions. They should be checked with structural inspection, energy calculations, and experiments."
        }

    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

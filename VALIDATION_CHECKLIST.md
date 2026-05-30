# Protein Fit Lock Studio Scientific Validation Checklist

This checklist helps decide whether a protein-protein interface prediction is ready for deeper computational or experimental validation.

## 1. Structure Quality

- Confirm the uploaded file is the intended biological assembly.
- Confirm chain identities.
- Check whether missing loops or unresolved residues occur at the interface.
- Remove irrelevant crystallographic partners if needed.
- Remove non-biological contacts from crystal packing.
- Check whether the model came from experiment, docking, AlphaFold, AlphaFold-Multimer, Rosetta, or another prediction tool.

## 2. Interface Geometry

- Review approximate shape-complementarity score.
- Review number of 5 Å contacts.
- Review number of 4 Å contacts.
- Review packing efficiency.
- Review interface density.
- Inspect whether the interface is broad and coherent rather than sparse and fragmented.

## 3. Clash Assessment

- Review steric clash-like contacts.
- Inspect severe clashes manually in PyMOL, ChimeraX, or the built-in 3D viewer.
- Perform side-chain repacking or minimisation if severe clashes are present.
- Re-run analysis after minimisation.

## 4. Chemical Interaction Assessment

- Review hydrogen-bond-like contacts.
- Review salt-bridge-like contacts.
- Review aromatic contacts.
- Review hydrophobic contacts.
- Check whether polar atoms are buried without satisfying interactions.
- Check whether charged residues are buried in an unfavourable environment.

## 5. Hotspot Assessment

- Review top interface residue hotspots.
- Avoid mutating hotspot residues without structural justification.
- Prioritise hotspot residues for alanine scanning or computational mutagenesis.
- Compare predicted hotspots with known biological epitope or paratope residues if available.

## 6. Redesign Decision

- If shape complementarity is weak, try alternative docking or backbone refinement.
- If clashes are high, repack side chains or minimise the complex.
- If packing is loose, redesign interface core residues.
- If polar networks are weak, consider rational polar contacts at solvent-exposed interface regions.
- If hydrophobic packing is low, consider strengthening the buried interface core.

## 7. Publication-Grade Follow-Up

Recommended tools:

- PyMOL or ChimeraX for manual inspection.
- FreeSASA for buried surface area.
- Rosetta InterfaceAnalyzer for interface energy and buried unsatisfied polar atoms.
- FoldX for mutation scanning.
- HADDOCK or RosettaDock for docking refinement.
- Molecular dynamics for interface stability.
- MM/GBSA or related methods for approximate binding energetics.
- SPR, BLI, ITC, ELISA, or cell-based binding assays for experimental validation.

## 8. Reporting

A useful report should include:

- Protein structure source.
- Chain identities.
- Interface score.
- Contact counts.
- Clash count.
- Salt-bridge-like contacts.
- Hydrogen-bond-like contacts.
- Aromatic contacts.
- Hotspot residues.
- Redesign recommendations.
- Limitations of the scoring method.
- Experimental validation plan.

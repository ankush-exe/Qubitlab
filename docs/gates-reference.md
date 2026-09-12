# Quantum gate reference

Quantum gates are reversible operations on qubits. A gate changes a state vector while preserving its total probability.

## Pauli gates

The X gate flips the computational basis: $X|0> = |1>$ and $X|1> = |0>$. Y also flips the basis while adding a phase. Z leaves the basis labels in place but changes the phase of $|1>$.

## Hadamard

The Hadamard gate is the most common way to create a balanced superposition. It maps $|0>$ to $(|0> + |1>)/sqrt(2)$ and $|1>$ to $(|0> - |1>)/sqrt(2)$.

## Controlled gates

A CNOT applies X to its target only when its control is $|1>$. When the control is in superposition, the operation can create entanglement.

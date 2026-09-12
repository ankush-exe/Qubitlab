# Common circuit patterns

## Prepare and measure

Use a gate sequence to prepare a state, then measure the qubits. The measurement gates are not just display; they turn amplitudes into sampled classical counts.

## Bell state

H on q0 followed by CNOT(q0, q1) creates the canonical Bell-state experiment. With enough shots, counts cluster around 00 and 11.

## Interference

H, then a phase-changing operation, then H again turns a phase difference into a measurable probability difference. This pattern is the small-scale version of many quantum algorithms.

## Controlled operation

A controlled gate makes one qubit's operation conditional on another. Check the control and target wires carefully: reversing them generally changes the circuit's meaning.

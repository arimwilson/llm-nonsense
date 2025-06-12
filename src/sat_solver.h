#ifndef SAT_SOLVER_H
#define SAT_SOLVER_H
#include <vector>

// CNF is represented as a vector of clauses; each clause is a vector of integers.
// Positive integer i represents variable i (1-indexed), negative integer -i represents NOT variable i.
// Example clause (x1 OR NOT x2) -> {1, -2}

bool is_satisfiable(int num_vars, const std::vector<std::vector<int>>& cnf);
// A simple DPLL style solver with unit propagation. This is typically much
// faster than the brute force algorithm above and is used for the runtime
// comparison in the tests.
bool is_satisfiable_fast(int num_vars, const std::vector<std::vector<int>>& cnf);

#endif // SAT_SOLVER_H

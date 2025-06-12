#include "sat_solver.h"
#include <cstdlib>
#include <vector>

bool is_satisfiable(int num_vars, const std::vector<std::vector<int>>& cnf) {
    // Iterate over all possible assignments
    const std::size_t total = static_cast<std::size_t>(1) << num_vars;
    for (std::size_t mask = 0; mask < total; ++mask) {
        bool formula_sat = true;
        for (const auto& clause : cnf) {
            bool clause_sat = false;
            for (int lit : clause) {
                int var = std::abs(lit) - 1; // convert to 0-index
                bool value = (mask >> var) & 1;
                if (lit < 0) value = !value;
                if (value) {
                    clause_sat = true;
                    break;
                }
            }
            if (!clause_sat) {
                formula_sat = false;
                break;
            }
        }
        if (formula_sat) return true;
    }
    return false;
}

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

namespace {

// Remove satisfied clauses and falsified literals from the CNF when variable
// `var` is assigned the boolean value `value`.
std::vector<std::vector<int>> apply_assignment(const std::vector<std::vector<int>>& cnf,
                                               int var, bool value) {
    std::vector<std::vector<int>> out;
    for (const auto& clause : cnf) {
        bool satisfied = false;
        std::vector<int> new_clause;
        for (int lit : clause) {
            int v = std::abs(lit) - 1;
            if (v == var) {
                bool lit_val = value;
                if (lit < 0) lit_val = !lit_val;
                if (lit_val) { satisfied = true; break; }
                // literal evaluates to false, so skip it
            } else {
                new_clause.push_back(lit);
            }
        }
        if (!satisfied) {
            if (new_clause.empty()) {
                out.push_back({});
                return out; // contains an empty clause -> unsatisfiable
            }
            out.push_back(std::move(new_clause));
        }
    }
    return out;
}

// Unit propagation. Returns false if a conflict is detected.
bool propagate_units(std::vector<std::vector<int>>& cnf,
                     std::vector<int>& assignment) {
    while (true) {
        bool changed = false;
        for (const auto& clause : cnf) {
            if (clause.size() == 1) {
                int lit = clause[0];
                int var = std::abs(lit) - 1;
                bool val = lit > 0;
                if (assignment[var] != 0) {
                    bool cur = assignment[var] > 0;
                    if (cur != val) return false;
                } else {
                    assignment[var] = val ? 1 : -1;
                    cnf = apply_assignment(cnf, var, val);
                }
                changed = true;
                break; // restart scanning from beginning
            }
        }
        if (!changed) break;
        for (const auto& cl : cnf) {
            if (cl.empty()) return false;
        }
    }
    return true;
}

bool dpll(std::vector<std::vector<int>> cnf,
          std::vector<int> assignment,
          int num_vars) {
    if (!propagate_units(cnf, assignment)) return false;
    if (cnf.empty()) return true;
    // choose first unassigned variable
    int var = -1;
    for (int i = 0; i < num_vars; ++i) {
        if (assignment[i] == 0) { var = i; break; }
    }
    if (var == -1) return false;

    // try true
    {
        auto assn = assignment;
        assn[var] = 1;
        auto cnf_true = apply_assignment(cnf, var, true);
        if (!cnf_true.empty() && dpll(cnf_true, assn, num_vars))
            return true;
        if (cnf_true.empty()) return true; // all clauses satisfied
    }

    // try false
    assignment[var] = -1;
    auto cnf_false = apply_assignment(cnf, var, false);
    if (!cnf_false.empty() && dpll(cnf_false, assignment, num_vars))
        return true;
    if (cnf_false.empty()) return true;

    return false;
}

} // namespace

bool is_satisfiable_fast(int num_vars, const std::vector<std::vector<int>>& cnf) {
    std::vector<int> assignment(num_vars, 0);
    return dpll(cnf, assignment, num_vars);
}

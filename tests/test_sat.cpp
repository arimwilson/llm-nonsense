#include "gtest/gtest.h"
#include "../src/sat_solver.h"
#include <chrono>

TEST(SATSolverTest, SingleVariable) {
    std::vector<std::vector<int>> cnf = {{1}};
    EXPECT_TRUE(is_satisfiable(1, cnf));
}

TEST(SATSolverTest, Contradiction) {
    std::vector<std::vector<int>> cnf = {{1}, {-1}};
    EXPECT_FALSE(is_satisfiable(1, cnf));
}

TEST(SATSolverTest, SmallFormula) {
    std::vector<std::vector<int>> cnf = {{1, 2}, {-1, 3}};
    EXPECT_TRUE(is_satisfiable(3, cnf));
}

TEST(SATSolverTest, LargeFormulaRuntime) {
    const int n = 25;
    std::vector<std::vector<int>> cnf;
    for (int i = 1; i <= n; ++i) {
        cnf.push_back({i});
    }
    std::vector<int> neg_clause;
    for (int i = 1; i <= n; ++i) neg_clause.push_back(-i);
    cnf.push_back(neg_clause);

    auto start = std::chrono::high_resolution_clock::now();
    bool sat = is_satisfiable(n, cnf);
    auto end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double> diff = end - start;
    EXPECT_FALSE(sat);
    EXPECT_GT(diff.count(), 1.0);
    std::cerr << "Large formula runtime: " << diff.count() << " seconds\n";
}

int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}

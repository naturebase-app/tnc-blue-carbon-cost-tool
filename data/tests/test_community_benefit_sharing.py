import unittest
from contextlib import ExitStack
from types import SimpleNamespace
from unittest.mock import patch

from v2.cost_calculator import CostCalculator


class CommunityBenefitSharingTests(unittest.TestCase):
    def create_calculator(self, revenue, other_opex, project_length=4):
        calculator = CostCalculator.__new__(CostCalculator)
        calculator.project = SimpleNamespace(
            default_project_length=4,
            community_benefit_sharing_fund=0.5,
        )
        calculator.project_length = project_length
        calculator.other_opex_total_cost_plan = other_opex
        calculator.revenue_profit_calculator = SimpleNamespace(
            calculate_est_revenue=lambda: revenue,
        )
        return calculator

    def test_thresholds_are_evaluated_per_year(self):
        calculator = self.create_calculator(
            {1: 100, 2: 100, 3: 120},
            {1: 95, 2: 90, 3: 90},
            project_length=3,
        )

        self.assertEqual(
            calculator.calculate_cummunity_benefit_sharing_fund(),
            {-4: 0, -3: 0, -2: 0, -1: 0, 1: 10, 2: 15, 3: 27, 4: 0},
        )

    def test_zero_other_opex_can_reach_sixty_percent(self):
        calculator = self.create_calculator({1: 100}, {})

        self.assertEqual(calculator.calculate_cummunity_benefit_sharing_fund()[1], 60)

    def test_no_revenue_and_inactive_years_have_no_share(self):
        calculator = self.create_calculator({1: 0, 2: 100}, {1: 20}, project_length=1)

        benefit_plan = calculator.calculate_cummunity_benefit_sharing_fund()

        self.assertEqual(benefit_plan[1], 0)
        self.assertEqual(benefit_plan[2], 0)

    def test_benefit_share_is_added_to_reported_opex(self):
        calculator = self.create_calculator({1: 100}, {}, project_length=1)
        calculator.opex_total_cost_plan = {year: 0 for year in [-4, -3, -2, -1, 1, 2, 3, 4]}
        non_benefit_plans = {
            "calculate_monitoring": {1: 40},
            "calculate_maintenance": {},
            "calculate_carbon_standard_fees": {},
            "calculate_baseline_reassessment": {},
            "calculate_mrv": {},
            "calculate_long_term_project_operating_cost": {},
        }
        with ExitStack() as stack:
            for name, plan in non_benefit_plans.items():
                stack.enter_context(patch.object(calculator, name, return_value=plan))
            opex_plan = calculator.calculate_opex_total()

        self.assertEqual(calculator.other_opex_total_cost_plan[1], 40)
        self.assertEqual(opex_plan[1], 80)


if __name__ == "__main__":
    unittest.main()
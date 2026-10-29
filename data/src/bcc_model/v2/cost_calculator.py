import re

import matplotlib.pyplot as plt  # noqa: I001
import pandas as pd
from IPython.display import Markdown, display
from v2.revenue_profit_calculator import RevenueProfitCalculator
from v2.sequestration_credits_calculator import SequestrationCreditsCalculator
from v2.utils import (
    aggregate_costs,
    calculate_cost_plan,
    calculate_funding_gap,
    calculate_irr,
    calculate_npv,
    create_simple_plan,
    find_first_zero_value,
)


class CostCalculator:
    """
    Class to calculate the costs associated with a project.
    It includes methods to calculate capital and operating expenditures,
    as well as revenue and credits.
    """

    def __init__(self, project):
        """Initialize the CostCalculator with a project object."""
        self.project = project
        self.revenue_profit_calculator = RevenueProfitCalculator(self.project)
        self.sequestration_credits_calculator = SequestrationCreditsCalculator(self.project)
        self.project_length = (
            self.project.restoration_project_length
            if self.project.activity == "Restoration"
            else self.project.conservation_project_length
        )
        self.capex_total_cost_plan = {
            i: 0 for i in range(-4, self.project.default_project_length + 1) if i != 0
        }
        self.opex_total_cost_plan = {
            i: 0 for i in range(-4, self.project.default_project_length + 1) if i != 0
        }

        # Calculate Capital expenditure (NPV)
        self.capex_cost_plan = self.calculate_capex_total()
        self.opex_cost_plan = self.calculate_opex_total()
        self.total_capex = sum(self.capex_cost_plan.values())
        self.total_capex_NPV = calculate_npv(self.capex_cost_plan, self.project.discount_rate)
        # Operating expenditure (NPV)
        self.total_opex = sum(self.opex_cost_plan.values())  # done
        self.total_opex_NPV = calculate_npv(self.opex_cost_plan, self.project.discount_rate)  # done
        self.total_NPV = self.total_capex_NPV + self.total_opex_NPV  # done
        # Calculate estimated revenue (NPV)
        self.estimated_revenue_plan = self.revenue_profit_calculator.calculate_est_revenue()
        # Total revenue (non-discounted)
        self.total_revenue = sum(self.estimated_revenue_plan.values())
        self.total_revenue_NPV = calculate_npv(
            self.estimated_revenue_plan, self.project.discount_rate
        )
        # Calculate Total credits
        self.total_credits_plan = (
            self.sequestration_credits_calculator.calculate_est_credits_issued()
        )
        self.credits_issued = sum(self.total_credits_plan.values())
        # Calculate project abatement potential
        net_emissions_reduction_plan = (
            self.sequestration_credits_calculator.calculate_net_emissions_reductions()
        )
        try:
            self.project_abatement_potential = round(sum(net_emissions_reduction_plan.values()))
        except Exception as e:
            print(f"Error calculating project abatement potential: {e}")
            self.project_abatement_potential = 0
        # Calculate $/tCO2e (NPV)
        self.cost_per_tCO2e = (
            self.total_NPV / self.credits_issued if self.credits_issued != 0 else 0
        )
        # Calculate $/ha (NPV)
        if (
            self.project.activity == "Restoration"
            and self.project.restoration_activity == "Planting"
        ):
            self.cost_per_ha = self.total_NPV / (
                self.project.project_size_ha * self.project.planting_success_rate
            )
        else:
            self.cost_per_ha = self.total_NPV / self.project.project_size_ha
        # Calculate NPV covering opex
        if self.project.carbon_revenues_to_cover == "Opex":
            self.NPV_covering_cost = self.total_revenue_NPV - self.total_opex_NPV
        else:
            self.NPV_covering_cost = self.total_revenue_NPV - self.total_NPV
        # Financing cost
        self.financing_cost = float(self.project.financing_cost) * float(self.total_capex)
        # Funding gap (NPV)
        if self.NPV_covering_cost < 0:
            self.funding_gap_NPV = self.NPV_covering_cost * -1
        else:
            self.funding_gap_NPV = 0
        # Funding gap per tCO2e (NPV)
        self.funding_gap_per_tco2_NPV = (
            self.funding_gap_NPV / self.credits_issued if self.credits_issued != 0 else 0
        )

        # Community benefit sharing fund fund % of revenue
        self.community_benefit_sharing_fund_plan = self.calculate_cummunity_benefit_sharing_fund()
        self.total_community_benefit_sharing_fund_NPV = calculate_npv(
            self.community_benefit_sharing_fund_plan, self.project.discount_rate
        )
        if self.total_revenue_NPV == 0:
            self.community_benefit_sharing_fund = 0
        else:
            self.community_benefit_sharing_fund = (
                self.total_community_benefit_sharing_fund_NPV / self.total_revenue_NPV
            )

        # Calculate funding gap
        reference_npv = (
            self.total_opex_NPV
            if self.project.carbon_revenues_to_cover == "Opex"
            else self.total_NPV
        )
        self.funding_gap = calculate_funding_gap(reference_npv, self.total_revenue_NPV)

        # IRR when priced to cover OPEX
        self.IRR_opex = calculate_irr(
            self.revenue_profit_calculator.calculate_annual_net_cash_flow(
                self.capex_total_cost_plan, self.opex_total_cost_plan
            ),
            self.revenue_profit_calculator.calculate_annual_net_income(self.opex_total_cost_plan),
            use_capex=False,
        )
        # IRR when priced to cover OPEX + CAPEX
        self.IRR_total_cost = calculate_irr(
            self.revenue_profit_calculator.calculate_annual_net_cash_flow(
                self.capex_total_cost_plan, self.opex_total_cost_plan
            ),
            self.revenue_profit_calculator.calculate_annual_net_income(self.opex_total_cost_plan),
            use_capex=True,
        )

    def calculate_capex_total(self):
        """
        Calculate the total capital expenditure (CAPEX) for the project.
        This includes various cost functions that are aggregated into a single plan.
        """
        # List of cost functions to call
        cost_functions = [
            self.calculate_feasibility_analysis_cost,
            self.calculate_conservation_planning_and_admin,
            self.calculate_data_collection_and_field_cost,
            self.calculate_community_representation,
            self.calculate_blue_carbon_project_planning,
            self.calculate_establishing_carbon_rights,
            self.calculate_validation,
            self.calculate_implementation_labor,
        ]

        for cost_func in cost_functions:
            cost_plan = cost_func()
            aggregate_costs(cost_plan, self.capex_total_cost_plan)

        return self.capex_total_cost_plan

    def calculate_opex_total(self):
        """
        Calculate the total operating expenditure (OPEX) for the project.
        This includes various cost functions that are aggregated into a single plan.
        """
        cost_functions = [
            self.calculate_monitoring,
            self.calculate_maintenance,
            self.calculate_carbon_standard_fees,
            self.calculate_baseline_reassessment,
            self.calculate_mrv,
            self.calculate_long_term_project_operating_cost,
        ]

        other_opex_total_cost_plan = {
            year: 0 for year in range(-4, self.project.default_project_length + 1) if year != 0
        }
        for cost_func in cost_functions:
            cost_plan = cost_func()
            aggregate_costs(cost_plan, other_opex_total_cost_plan)

        self.other_opex_total_cost_plan = other_opex_total_cost_plan
        self.opex_total_cost_plan = dict(other_opex_total_cost_plan)
        aggregate_costs(
            self.calculate_cummunity_benefit_sharing_fund(), self.opex_total_cost_plan
        )

        return self.opex_total_cost_plan

    def calculate_feasibility_analysis_cost(self):
        "CAPEX function to calculate feasibility analysis cost."
        total_base_cost = calculate_cost_plan(
            self.project.base_size,
            self.project.base_increase,
            self.project.project_size_ha,
            "feasibility_analysis",
            self.project.feasibility_analysis,
            self.project.activity,
            self.project.ecosystem,
        )
        feasibility_analysis_cost_plan = create_simple_plan(total_base_cost, years=[-4])
        return feasibility_analysis_cost_plan

    def calculate_conservation_planning_and_admin(self):
        "CAPEX function to calculate conservation planning and admin cost."
        total_base_cost = calculate_cost_plan(
            self.project.base_size,
            self.project.base_increase,
            self.project.project_size_ha,
            "conservation_planning_and_admin",
            self.project.conservation_planning_and_admin,
            self.project.activity,
            self.project.ecosystem,
        )
        conservation_cost_plan = create_simple_plan(total_base_cost, years=[-4, -3, -2, -1])
        return conservation_cost_plan

    def calculate_data_collection_and_field_cost(self):
        "CAPEX function to calculate data collection and field cost."
        total_base_cost = calculate_cost_plan(
            self.project.base_size,
            self.project.base_increase,
            self.project.project_size_ha,
            "data_collection_and_field_cost",
            self.project.data_collection_and_field_cost,
            self.project.activity,
            self.project.ecosystem,
        )

        data_collection_cost_plan = create_simple_plan(total_base_cost, years=[-4, -3, -2])

        return data_collection_cost_plan

    def calculate_community_representation(self):
        "CAPEX function to calculate community representation/liaison cost."
        total_base_cost = calculate_cost_plan(
            self.project.base_size,
            self.project.base_increase,
            self.project.project_size_ha,
            "community_representation",
            self.project.community_representation,
            self.project.activity,
            self.project.ecosystem,
        )
        project_development_type = self.project.master_table.loc[
            (self.project.master_table["country_code"] == self.project.country_code)
            & (self.project.master_table["ecosystem"] == self.project.ecosystem),
            "other_community_cash_flow",
        ].values[0]
        initial_cost = total_base_cost if project_development_type == "Development" else 0
        community_rep_cost_plan = create_simple_plan(total_base_cost, years=[-4, -3, -2, -1])
        community_rep_cost_plan[-4] = initial_cost  # Adjust for -4 based on project type
        return community_rep_cost_plan

    def calculate_blue_carbon_project_planning(self):
        "CAPEX function to calculate blue carbon project planning cost."
        total_base_cost = calculate_cost_plan(
            self.project.base_size,
            self.project.base_increase,
            self.project.project_size_ha,
            "blue_carbon_project_planning",
            self.project.blue_carbon_project_planning,
            self.project.activity,
            self.project.ecosystem,
        )
        blue_carbon_plan = create_simple_plan(total_base_cost, years=[-1])
        return blue_carbon_plan

    def calculate_establishing_carbon_rights(self):
        "CAPEX function to calculate establishing carbon rights cost."
        total_base_cost = calculate_cost_plan(
            self.project.base_size,
            self.project.base_increase,
            self.project.project_size_ha,
            "establishing_carbon_rights",
            self.project.establishing_carbon_rights,
            self.project.activity,
            self.project.ecosystem,
        )
        carbon_rights_plan = create_simple_plan(total_base_cost, years=[-3, -2, -1])
        return carbon_rights_plan

    def calculate_validation(self):
        "CAPEX function to calculate validation cost."
        total_base_cost = calculate_cost_plan(
            self.project.base_size,
            self.project.base_increase,
            self.project.project_size_ha,
            "validation",
            self.project.validation,
            self.project.activity,
            self.project.ecosystem,
        )
        validation_plan = create_simple_plan(total_base_cost, years=[-1])
        return validation_plan

    def calculate_implementation_labor(self):
        "CAPEX function to calculate implementation labor cost."
        base_cost = (
            self.project.implementation_labor if self.project.activity == "Restoration" else 0
        )
        area_restored_or_conserved_plan = (
            self.sequestration_credits_calculator.calculate_area_restored_or_conserved()
        )
        # Initialize implementation labor cost plan excluding year 0
        implementation_labor_cost_plan = {
            year: 0 for year in range(-4, self.project.default_project_length + 1) if year != 0
        }
        for year in range(-1, 41):
            if year == 0:
                continue
            if year <= self.project_length:
                if (year - 1) == 0:
                    labor_cost = float(base_cost) * (
                        float(area_restored_or_conserved_plan[year])
                        - float(area_restored_or_conserved_plan[-1])
                    )
                else:
                    labor_cost = float(base_cost) * (
                        float(area_restored_or_conserved_plan[year])
                        - float(area_restored_or_conserved_plan.get(year - 1, 0))
                    )
                implementation_labor_cost_plan[year] = labor_cost
        return implementation_labor_cost_plan

    def calculate_monitoring(self):
        "OPEX function to calculate the monitoring cost."
        total_base_cost = calculate_cost_plan(
            self.project.base_size,
            self.project.base_increase,
            self.project.project_size_ha,
            "monitoring",
            self.project.monitoring,
            self.project.activity,
            self.project.ecosystem,
        )
        # Monitoring plan
        monitoring_cost_plan = {
            year: 0 for year in range(-4, self.project.default_project_length + 1) if year != 0
        }
        for year, _ in monitoring_cost_plan.items():
            if year < 1:
                continue
            else:
                if year <= self.project_length:
                    monitoring_cost_plan[year] = total_base_cost
        return monitoring_cost_plan

    def _compute_maintenance_end_year(self, maintenance_duration, first_zero_value):
        restoration_plan = self.project.restoration_plan

        if self.project.updated_restoration_plan:
            # Use the plan’s items to filter out positive values
            valid_keys = [key for key, value in restoration_plan.items() if value > 0]
            if not valid_keys:
                raise ValueError("No valid restoration plan entries found with value > 0.")
            # replicate MAXIFS: get max key for which value > 0
            max_value = max(valid_keys)
            return float(max_value) + float(maintenance_duration) + 1
        elif (self.project.project_size_ha / self.project.restoration_rate) <= 20:
            return float(first_zero_value) + float(maintenance_duration) - 1
        else:
            return 30 + float(maintenance_duration)

    def calculate_maintenance(self):
        "OPEX function to calculate the maintenance cost."
        base_cost = self.project.maintenance

        if float(base_cost) < 1:
            key = "% of implementation labor"
        else:
            key = "$/yr"

        # Get the maintenance duration from the master table
        maintenance_duration = self.project.master_table.loc[
            (self.project.master_table["country_code"] == self.project.country_code)
            & (self.project.master_table["ecosystem"] == self.project.ecosystem),
            "maintenance_duration",
        ].values[0]

        # Call the function to calculate the implementation labor plan
        implementation_labor_cost_plan = self.calculate_implementation_labor()

        # Find the first year where the cost is zero
        first_zero_value = find_first_zero_value(implementation_labor_cost_plan)

        if first_zero_value is None:
            raise ValueError("No zero value found in the implementation labor cost plan.")
        # Calculate when maintenance should end
        maintenance_end_year = self._compute_maintenance_end_year(
            maintenance_duration, first_zero_value
        )
        # Initialize the maintenance cost plan excluding year 0
        # NOTE: Double check with the client because they are fixing the implementation_labor_cost
        maintenance_cost_plan = {
            year: 0 for year in range(-4, self.project.default_project_length + 1) if year != 0
        }

        for year in range(1, self.project_length + 1):
            if year > self.project_length or year > maintenance_end_year:
                maintenance_cost_plan[year] = 0
            else:
                if key == "$/yr":
                    # Flat cost per year
                    maintenance_cost_plan[year] = float(base_cost)
                else:
                    if year < maintenance_duration + 2:
                        lower_bound = year - 2 - maintenance_duration
                    else:
                        lower_bound = year - 1 - maintenance_duration
                    upper_bound = year - 1

                    labor_sum = sum(
                        cost
                        for yr, cost in implementation_labor_cost_plan.items()
                        if lower_bound < yr <= upper_bound
                    )

                    # Apply multiplier (base cost)
                    maintenance_cost_plan[year] = labor_sum * float(base_cost)
        return maintenance_cost_plan

    def calculate_cummunity_benefit_sharing_fund(self):
        "OPEX function to calculate the community benefit sharing fund cost."
        community_benefit_rate = 0.1
        community_benefit_sharing_fund_cost_plan = {
            year: 0 for year in range(-4, self.project.default_project_length + 1) if year != 0
        }
        estimated_revenue = self.revenue_profit_calculator.calculate_est_revenue()
        for year, _ in community_benefit_sharing_fund_cost_plan.items():
            if year <= self.project_length:
                revenue = float(estimated_revenue.get(year, 0))
                base_benefit_share = revenue * community_benefit_rate
                other_opex = self.other_opex_total_cost_plan.get(year, 0)
                profit_share = (
                    max(revenue - other_opex, 0) * 0.5
                    if revenue >= other_opex + base_benefit_share
                    else 0
                )
                community_benefit_sharing_fund_cost_plan[year] = (
                    base_benefit_share + profit_share
                )
            else:
                community_benefit_sharing_fund_cost_plan[year] = 0
        return community_benefit_sharing_fund_cost_plan

    def calculate_carbon_standard_fees(self):
        "OPEX function to calculate the carbon standard fees cost."
        base_cost = self.project.carbon_standard_fees
        # Compute carbon standard fees cost plan
        carbon_standard_fees_cost_plan = {
            year: 0 for year in range(-4, self.project.default_project_length + 1) if year != 0
        }
        estimated_credits_issued = (
            self.sequestration_credits_calculator.calculate_est_credits_issued()
        )
        for year, _ in carbon_standard_fees_cost_plan.items():
            if year <= -1:
                carbon_standard_fees_cost_plan[year] = 0
            elif year <= self.project_length:
                carbon_standard_fees_cost_plan[year] = float(
                    estimated_credits_issued[year]
                ) * float(base_cost)
            else:
                carbon_standard_fees_cost_plan[year] = 0
        return carbon_standard_fees_cost_plan

    def calculate_baseline_reassessment(self):
        "OPEX function to calculate the baseline reassessment cost."
        base_cost = self.project.baseline_reassessment
        # Compute baseline reassessment cost plan
        baseline_reassessment_cost_plan = {
            year: 0 for year in range(-4, self.project.default_project_length + 1) if year != 0
        }
        for year, _ in baseline_reassessment_cost_plan.items():
            if year < -1:
                baseline_reassessment_cost_plan[year] = 0
            elif year == -1:
                baseline_reassessment_cost_plan[year] = float(base_cost)
            elif year <= self.project_length:
                if year / self.project.baseline_reassessment_frequency == int(
                    year / self.project.baseline_reassessment_frequency
                ):
                    baseline_reassessment_cost_plan[year] = float(base_cost) * (
                        1 + float(self.project.annual_cost_increase)
                    ) ** int(year)
                else:
                    baseline_reassessment_cost_plan[year] = 0
            else:
                baseline_reassessment_cost_plan[year] = 0
        return baseline_reassessment_cost_plan

    def calculate_mrv(self):
        "OPEX function to calculate the MRV cost."
        base_cost = self.project.mrv
        # Compute MRV cost plan
        mrv_cost_plan = {
            year: 0 for year in range(-4, self.project.default_project_length + 1) if year != 0
        }
        for year, _ in mrv_cost_plan.items():
            if year <= -1:
                mrv_cost_plan[year] = 0
            elif year <= self.project_length:
                if year / self.project.verification_frequency == int(
                    year / self.project.verification_frequency
                ):
                    mrv_cost_plan[year] = float(base_cost) * (
                        1 + float(self.project.annual_cost_increase)
                    ) ** int(year)
                else:
                    mrv_cost_plan[year] = 0
            else:
                mrv_cost_plan[year] = 0
        return mrv_cost_plan

    def calculate_long_term_project_operating_cost(self):
        "OPEX function to calculate the long-term project operating cost."
        base_size = self.project.base_size.loc[
            (self.project.base_size["activity"] == self.project.activity)
            & (self.project.base_size["ecosystem"] == self.project.ecosystem),
            "long_term_project_operating_cost",
        ].values[0]
        if base_size == 0:
            raise ValueError("Base size must be non-zero to avoid division errors.")
        base_cost = self.project.long_term_project_operating_cost
        increased_by = self.project.base_increase.loc[
            self.project.base_increase["ecosystem"] == self.project.ecosystem,
            "long_term_project_operating_cost",
        ].values[0]

        # Add a conditional check to handle cases where there is an empty or undefined value
        if (
            not base_cost
            or not self.project.project_size_ha
            or not self.project.starting_point_scaling
        ):
            raise ValueError("Required project attributes are missing.")
        if (
            float(self.project.project_size_ha) - float(self.project.starting_point_scaling)
        ) / float(base_size) < 1:
            total_base_cost_add = 0
        else:
            total_base_cost_add = round(
                (self.project.project_size_ha - self.project.starting_point_scaling) / base_size
            )
        total_base_cost = float(base_cost) + (
            float(total_base_cost_add) * float(increased_by) * float(base_cost)
        )
        # Compute long-term project operating cost plan
        long_term_project_operating_cost_plan = {
            year: 0 for year in range(-4, self.project.default_project_length + 1) if year != 0
        }
        for year, _ in long_term_project_operating_cost_plan.items():
            if year <= -1:
                long_term_project_operating_cost_plan[year] = 0
            elif year <= self.project_length:
                long_term_project_operating_cost_plan[year] = float(total_base_cost)
            else:
                long_term_project_operating_cost_plan[year] = 0
        return long_term_project_operating_cost_plan

    def get_summary(self, table=True):
        """
        Displays a markdown table with a summary of the project costs and revenues.
        """
        # Project summary
        summary_dict = {
            "Project": f"{self.project.country} {self.project.ecosystem} {self.project.activity} ({self.project.project_size_ha} ha)",
            "$/tCO2e (total cost, NPV)": f"${self.cost_per_tCO2e:,.0f}",
            "$/ha": f"${self.cost_per_ha:,.0f}",
            "NPV covering cost": f"${self.NPV_covering_cost:,.0f}",
            "IRR when priced to cover opex": f"{self.IRR_opex:.1%}",
            "IRR when priced to cover total costs": f"{self.IRR_total_cost:.1%}",
            "Total cost (NPV)": f"${self.total_NPV:,.0f}",
            "Capital expenditure (NPV)": f"${self.total_capex_NPV:,.0f}",
            "Operating expenditure (NPV)": f"${self.total_opex_NPV:,.0f}",
            "Credits issued": f"{self.credits_issued:,.0f}",
            "Total abatement potential (tCO2e, without buffer)": f"{self.project_abatement_potential:,.0f}",
            "Total revenue (NPV)": f"${self.total_revenue_NPV:,.0f}",
            "Total revenue (non-discounted)": f"${self.total_revenue:,.0f}",
            "Financing cost": f"${self.financing_cost:,.0f}",
            "Funding gap (NPV)": f"${self.funding_gap_NPV:,.0f}",
            "Funding gap per tCO2e (NPV)": f"${self.funding_gap_per_tco2_NPV:,.1f}",
            "Community benefit sharing fund % of revenue": f"{self.community_benefit_sharing_fund:.0%}",
        }

        # Display the summary table
        if table:
            summary_table = """\
            ### Project Summary

            | Parameter | Value |
            | --------- | ----- |
            """
            for key, value in summary_dict.items():
                summary_table += f"| {key} | {value} |\n"
            summary_table = re.sub(r"\n\s+\|", "\n|", summary_table.strip())

            display(Markdown(summary_table))

        return {
            "Project summary": summary_dict,
        }

    def get_cost_estimates(self, table=True):
        """
        Displays a markdown table with all the CAPEX and OPEX cost estimates as well as the
        Total cost and NPV cost.
        """
        # Define the data with cost categories, total costa and NPV values
        data = {
            "Cost estimates (USD)": [
                "Capital expenditure",
                "Feasibility analysis",
                "Conservation planning and admin",
                "Data collection and field costs",
                "Community representation / liaison",
                "Blue carbon project planning",
                "Establishing carbon rights",
                "Validation",
                "Implementation labor",
                "Operating expenditure",
                "Monitoring",
                "Maintenance",
                "Community benefit sharing fund",
                "Carbon standard fees",
                "Baseline reassessment",
                "MRV",
                "Long-term project operating",
                "Total cost",
            ],
            "Total cost": [
                sum(self.capex_total_cost_plan.values()),
                sum(self.calculate_feasibility_analysis_cost().values()),
                sum(self.calculate_conservation_planning_and_admin().values()),
                sum(self.calculate_data_collection_and_field_cost().values()),
                sum(self.calculate_community_representation().values()),
                sum(self.calculate_blue_carbon_project_planning().values()),
                sum(self.calculate_establishing_carbon_rights().values()),
                sum(self.calculate_validation().values()),
                sum(self.calculate_implementation_labor().values()),
                sum(self.opex_total_cost_plan.values()),
                sum(self.calculate_monitoring().values()),
                sum(self.calculate_maintenance().values()),
                sum(self.calculate_cummunity_benefit_sharing_fund().values()),
                sum(self.calculate_carbon_standard_fees().values()),
                sum(self.calculate_baseline_reassessment().values()),
                sum(self.calculate_mrv().values()),
                sum(self.calculate_long_term_project_operating_cost().values()),
                sum(self.capex_total_cost_plan.values()) + sum(self.opex_total_cost_plan.values()),
            ],
            "NPV": [
                self.total_capex_NPV,
                calculate_npv(
                    self.calculate_feasibility_analysis_cost(), self.project.discount_rate
                ),
                calculate_npv(
                    self.calculate_conservation_planning_and_admin(), self.project.discount_rate
                ),
                calculate_npv(
                    self.calculate_data_collection_and_field_cost(), self.project.discount_rate
                ),
                calculate_npv(
                    self.calculate_community_representation(), self.project.discount_rate
                ),
                calculate_npv(
                    self.calculate_blue_carbon_project_planning(), self.project.discount_rate
                ),
                calculate_npv(
                    self.calculate_establishing_carbon_rights(), self.project.discount_rate
                ),
                calculate_npv(self.calculate_validation(), self.project.discount_rate),
                calculate_npv(self.calculate_implementation_labor(), self.project.discount_rate),
                self.total_opex_NPV,
                calculate_npv(self.calculate_monitoring(), self.project.discount_rate),
                calculate_npv(self.calculate_maintenance(), self.project.discount_rate),
                calculate_npv(
                    self.calculate_cummunity_benefit_sharing_fund(), self.project.discount_rate
                ),
                calculate_npv(self.calculate_carbon_standard_fees(), self.project.discount_rate),
                calculate_npv(self.calculate_baseline_reassessment(), self.project.discount_rate),
                calculate_npv(self.calculate_mrv(), self.project.discount_rate),
                calculate_npv(
                    self.calculate_long_term_project_operating_cost(), self.project.discount_rate
                ),
                self.total_capex_NPV + self.total_opex_NPV,
            ],
        }
        # Display the cost estimates table if required
        if table:
            # Create a Markdown table from the data
            cost_estimates_table = """\
            ### Cost Estimates

            | Cost estimates (USD)   | Total cost  | NPV    |
            | ---------------------- | ----------- | ------ |
            """
            for n in range(len(data["Cost estimates (USD)"])):
                key = data["Cost estimates (USD)"][n]
                # Format Total cost and NPV columns as currency with thousands separators
                total_cost = (
                    f"${data['Total cost'][n]:,.0f}"
                    if isinstance(data["Total cost"][n], (int, float))
                    else data["Total cost"][n]
                )
                npv = (
                    f"${data['NPV'][n]:,.0f}"
                    if isinstance(data["NPV"][n], (int, float))
                    else data["NPV"][n]
                )
                if key in ["Capital expenditure", "Operating expenditure", "Total cost"]:
                    cost_estimates_table += f"| **{key}** | **{total_cost}** | **{npv}** |\n"
                else:
                    cost_estimates_table += f"| {key} | {total_cost} | {npv} |\n"
            cost_estimates_table = re.sub(r"\n\s+\|", "\n|", cost_estimates_table.strip())

            display(Markdown(cost_estimates_table))

        # Create the dataframe
        df = pd.DataFrame(data)

        # Format Total cost and NPV columns as currency with thousands separators
        # TODO: instead of modifying datatypes is much better to use pandas formatter like .style.format(na_rep='MISS', precision=1, subset=[0]).format(na_rep='PASS', precision=2, subset=[1, 2])
        df["Total cost"] = df["Total cost"].apply(
            lambda x: f"${x:,.0f}" if isinstance(x, (int, float)) else x
        )
        df["NPV"] = df["NPV"].apply(lambda x: f"${x:,.0f}" if isinstance(x, (int, float)) else x)

        return df

    def get_yearly_cost_breakdown(self, table=True):
        """
        Returns dataframe with yearly breakdown for each cost category.
        """

        # Helper function to extend cost plans
        def extend_cost_plan(cost_plan):
            return [
                cost_plan.get(year, 0) for year in range(-4, self.project_length + 1) if year != 0
            ]

        # Yearly breakdown based on the project lenght
        years = [year for year in range(-4, self.project_length + 1) if year != 0] + [
            "Total",
            "NPV",
        ]

        # Calculate cost plans for each category once
        cost_plans = {
            "feasibility_analysis": self.calculate_feasibility_analysis_cost(),
            "conservation_planning_and_admin": self.calculate_conservation_planning_and_admin(),
            "data_collection_and_field": self.calculate_data_collection_and_field_cost(),
            "community_representation": self.calculate_community_representation(),
            "blue_carbon_project_planning": self.calculate_blue_carbon_project_planning(),
            "establishing_carbon_rights": self.calculate_establishing_carbon_rights(),
            "validation": self.calculate_validation(),
            "implementation_labor": self.calculate_implementation_labor(),
            "capex_total": self.capex_total_cost_plan,
            "monitoring": self.calculate_monitoring(),
            "maintenance": self.calculate_maintenance(),
            "community_benefit_sharing_fund": self.calculate_cummunity_benefit_sharing_fund(),
            "carbon_standard_fees": self.calculate_carbon_standard_fees(),
            "baseline_reassessment": self.calculate_baseline_reassessment(),
            "MRV": self.calculate_mrv(),
            "long_term_project_operating": self.calculate_long_term_project_operating_cost(),
            "opex_total": self.opex_total_cost_plan,
        }

        # Set all the cost values to negative values for all the cost plans
        for key, value in cost_plans.items():
            cost_plans[key] = {k: -v for k, v in value.items()}

        # Summarize CAPEX and OPEX
        total_cost_plan = {
            k: cost_plans["capex_total"].get(k, 0) + cost_plans["opex_total"].get(k, 0)
            for k in set(cost_plans["capex_total"]) | set(cost_plans["opex_total"])
        }

        # Calculate estimated revenue and credits
        estimated_revenue = self.revenue_profit_calculator.calculate_est_revenue()
        estimated_credits_issued = (
            self.sequestration_credits_calculator.calculate_est_credits_issued()
        )

        # Annual net cash flow (revenue - total cost)
        annual_net_cash_flow = self.revenue_profit_calculator.calculate_annual_net_cash_flow(
            self.capex_total_cost_plan, self.opex_total_cost_plan
        )

        # Annual net income (revenue - OPEX)
        annual_net_income = self.revenue_profit_calculator.calculate_annual_net_income(
            self.opex_total_cost_plan
        )

        # Cumulative net income (NPV) for revenue - OPEX
        cumulative_net_income = {}
        # Cumulative net income (NPV) for revenue - CAPEX - OPEX
        cumulative_net_income_capex_opex = {}
        for year in range(-4, self.project_length + 1):
            if year != 0:
                if year == -4:
                    cumulative_net_income[year] = annual_net_income[year]
                    cumulative_net_income_capex_opex[year] = annual_net_cash_flow[year]
                else:
                    cost_plan_opex = {
                        k: v for k, v in annual_net_income.items() if k <= year and k > -4
                    }
                    cost_plan_capex_opex = {
                        k: v for k, v in annual_net_cash_flow.items() if k <= year and k > -4
                    }
                    cumulative_net_income[year] = annual_net_income[-4] + calculate_npv(
                        cost_plan_opex, self.project.discount_rate
                    )
                    cumulative_net_income_capex_opex[year] = annual_net_cash_flow[
                        -4
                    ] + calculate_npv(cost_plan_capex_opex, self.project.discount_rate)

        # Extend cost plans for each category
        extended_costs = {name: extend_cost_plan(plan) for name, plan in cost_plans.items()}

        # Define data for each cost/revenue category
        data = {
            "Feasibility analysis": extended_costs["feasibility_analysis"]
            + [
                sum(cost_plans["feasibility_analysis"].values()),
                calculate_npv(cost_plans["feasibility_analysis"], self.project.discount_rate),
            ],
            "Conservation planning and admin": extended_costs["conservation_planning_and_admin"]
            + [
                sum(cost_plans["conservation_planning_and_admin"].values()),
                calculate_npv(
                    cost_plans["conservation_planning_and_admin"], self.project.discount_rate
                ),
            ],
            "Data collection and field costs": extended_costs["data_collection_and_field"]
            + [
                sum(cost_plans["data_collection_and_field"].values()),
                calculate_npv(cost_plans["data_collection_and_field"], self.project.discount_rate),
            ],
            "Community representation / liaison": extended_costs["community_representation"]
            + [
                sum(cost_plans["community_representation"].values()),
                calculate_npv(cost_plans["community_representation"], self.project.discount_rate),
            ],
            "Blue carbon project planning": extended_costs["blue_carbon_project_planning"]
            + [
                sum(cost_plans["blue_carbon_project_planning"].values()),
                calculate_npv(
                    cost_plans["blue_carbon_project_planning"], self.project.discount_rate
                ),
            ],
            "Establishing carbon rights": extended_costs["establishing_carbon_rights"]
            + [
                sum(cost_plans["establishing_carbon_rights"].values()),
                calculate_npv(cost_plans["establishing_carbon_rights"], self.project.discount_rate),
            ],
            "Validation": extended_costs["validation"]
            + [
                sum(cost_plans["validation"].values()),
                calculate_npv(cost_plans["validation"], self.project.discount_rate),
            ],
            "Implementation labor": extended_costs["implementation_labor"]
            + [
                sum(cost_plans["implementation_labor"].values()),
                calculate_npv(cost_plans["implementation_labor"], self.project.discount_rate),
            ],
            "Total capex": extended_costs["capex_total"]
            + [-self.total_capex, -self.total_capex_NPV],
            "Monitoring": extended_costs["monitoring"]
            + [
                sum(cost_plans["monitoring"].values()),
                calculate_npv(cost_plans["monitoring"], self.project.discount_rate),
            ],
            "Maintenance": extended_costs["maintenance"]
            + [
                sum(cost_plans["maintenance"].values()),
                calculate_npv(cost_plans["maintenance"], self.project.discount_rate),
            ],
            "Community benefit sharing fund": extended_costs["community_benefit_sharing_fund"]
            + [
                sum(cost_plans["community_benefit_sharing_fund"].values()),
                calculate_npv(
                    cost_plans["community_benefit_sharing_fund"], self.project.discount_rate
                ),
            ],
            "Carbon standard fees": extended_costs["carbon_standard_fees"]
            + [
                sum(cost_plans["carbon_standard_fees"].values()),
                calculate_npv(cost_plans["carbon_standard_fees"], self.project.discount_rate),
            ],
            "Baseline reassessment": extended_costs["baseline_reassessment"]
            + [
                sum(cost_plans["baseline_reassessment"].values()),
                calculate_npv(cost_plans["baseline_reassessment"], self.project.discount_rate),
            ],
            "MRV": extended_costs["MRV"]
            + [
                sum(cost_plans["MRV"].values()),
                calculate_npv(cost_plans["MRV"], self.project.discount_rate),
            ],
            "Long-term project operating": extended_costs["long_term_project_operating_cost"]
            + [
                sum(cost_plans["long_term_project_operating_cost"].values()),
                calculate_npv(
                    cost_plans["long_term_project_operating_cost"], self.project.discount_rate
                ),
            ],
            "Total opex": extended_costs["opex_total"] + [-self.total_opex, -self.total_opex_NPV],
            "Total cost": extend_cost_plan(total_cost_plan)
            + [sum(total_cost_plan.values()), -self.total_NPV],
            "Est. credits issued": extend_cost_plan(estimated_credits_issued)
            + [sum(estimated_credits_issued.values()), 0],
            "Est. revenue": extend_cost_plan(estimated_revenue)
            + [
                sum(estimated_revenue.values()),
                calculate_npv(estimated_revenue, self.project.discount_rate),
            ],
            "Annual net cash flow": extend_cost_plan(annual_net_cash_flow)
            + [
                sum(annual_net_cash_flow.values()),
                calculate_npv(annual_net_cash_flow, self.project.discount_rate),
            ],
            "Annual net income (revenue – OPEX)": extend_cost_plan(annual_net_income)
            + [
                sum(annual_net_income.values()),
                calculate_npv(annual_net_income, self.project.discount_rate),
            ],
            "Cumulative net income (revenue - OPEX)": extend_cost_plan(cumulative_net_income)
            + [0, 0],
            "Cumulative net income (revenue - CAPEX - OPEX)": extend_cost_plan(
                cumulative_net_income_capex_opex
            )
            + [0, 0],
        }

        # Format values by rounding the cost to 0 decimal places
        # Keep two decimal places for the estimated credits issued:
        for key, value in data.items():
            data[key] = [
                round(x, 2) if key == "Est. credits issued" else round(x, 0) for x in value
            ]
        if table:
            # Create a Markdown table from the data
            pro_forma_table = """\
            ### Pro Forma Financials
            """
            pro_forma_table += "| Year |"
            for year in years:
                pro_forma_table += f" {year} |"
            pro_forma_table += "\n| --- |" + "|".join([" --- " for _ in years]) + " |\n"

            for key, value in data.items():
                if key in ["Total capex", "Total opex", "Total cost", "Est. revenue"]:
                    pro_forma_table += f"| **{key}** |"
                    for x in value:
                        pro_forma_table += f" **{x}** |"
                else:
                    pro_forma_table += f"| {key} |"
                    for x in value:
                        pro_forma_table += f" {x} |"
                pro_forma_table += "\n"

            pro_forma_table = re.sub(r"\n\s+\|", "\n|", pro_forma_table.strip())

            display(Markdown(pro_forma_table))

        # Create a df
        df = pd.DataFrame(data, index=years).transpose()

        return df

    def plot_financial_data(self):
        """Plot the summary of the financial data."""

        # Extract relevant time period from the df
        df = self.get_yearly_cost_breakdown(table=False)
        time_period = df.columns[:-2]  # Exclude the total and NPV columns

        total_capex = df.loc["Total capex", time_period]
        total_opex = df.loc["Total opex", time_period]
        estimated_revenue = df.loc["Est. revenue", time_period]
        cumulative_net_income_revenue_opex = df.loc[
            "Cumulative net income (revenue - OPEX)", time_period
        ]
        annual_net_cash_flow = df.loc["Annual net cash flow", time_period]

        # Create the figure and the axes
        fig, ax1 = plt.subplots(figsize=(12, 8))

        # Bar plots for total Capex, total opex and estimated revenue
        ax1.bar(time_period, total_capex, label="Total Cost", color="blue", alpha=0.6)
        ax1.bar(
            time_period, total_opex, bottom=total_capex, label="Total Opex", color="blue", alpha=0.6
        )
        ax1.bar(time_period, estimated_revenue, label="Estimated Revenue", color="green", alpha=0.6)

        # Line plots for annual net cash flow and cumulative net income
        ax1.plot(
            time_period,
            cumulative_net_income_revenue_opex,
            label="Cumulative net income (revenue - OPEX)",
            color="yellow",
            marker="o",
        )
        ax1.plot(
            time_period,
            annual_net_cash_flow,
            label="Annual net cash flow",
            color="green",
            marker="o",
        )

        # Set the labels and the title
        ax1.set_xlabel("Time Periods")
        ax1.set_ylabel("Cash Flow (Bar Chart)", color="black")

        # Title and Legend
        plt.title("Financial Overview: Capex, Opex, Revenue, Net Cash Flow, Cumulative Income")

        # Combine legends from both y-axes
        ax1.legend(loc="upper left")

        # Show the plot
        plt.tight_layout()
        plt.show()

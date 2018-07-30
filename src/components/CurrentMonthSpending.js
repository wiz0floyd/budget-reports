import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import SpendingChart from "./SpendingChart";
import { splitTransactions, filterTransactions } from "../utils";

class CurrentMonthSpending extends PureComponent {
  static propTypes = {
    budget: PropTypes.shape({
      transactions: PropTypes.array.isRequired
    }).isRequired,
    currentMonth: PropTypes.string.isRequired,
    investmentAccounts: PropTypes.object.isRequired
  };

  render() {
    const { budget, currentMonth, investmentAccounts } = this.props;
    const { expenseTransactions } = splitTransactions(budget);
    const transactions = filterTransactions({ budget, investmentAccounts })(
      expenseTransactions
    );

    return (
      <SpendingChart
        budgetId={budget.id}
        currentMonth={currentMonth}
        transactions={transactions}
      />
    );
  }
}

export default CurrentMonthSpending;

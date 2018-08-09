import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import compose from "lodash/fp/compose";
import get from "lodash/fp/get";
import groupBy from "lodash/fp/groupBy";
import map from "lodash/fp/map";
import sortBy from "lodash/fp/sortBy";
import sumBy from "lodash/fp/sumBy";
import pages, { makeLink } from "../pages";
import { sumByProp } from "../optimized";
import CollapsibleSection from "./CollapsibleSection";
import { ListItemLink } from "./ListItem";
import LabelWithTransactionCount from "./LabelWithTransactionCount";
import AmountWithPercentage from "./AmountWithPercentage";
import NoTransactions from "./NoTransactions";

const mapWithKeys = map.convert({ cap: false });

class CurrentMonthGroupsSection extends PureComponent {
  static propTypes = {
    budget: PropTypes.shape({
      categoriesById: PropTypes.objectOf(
        PropTypes.shape({
          category_group_id: PropTypes.string.isRequired,
          id: PropTypes.string.isRequired
        })
      ).isRequired,
      categoryGroupsById: PropTypes.objectOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired
        })
      ).isRequired,
      id: PropTypes.string.isRequired
    }).isRequired,
    transactions: PropTypes.arrayOf(
      PropTypes.shape({
        amount: PropTypes.number.isRequired,
        category_id: PropTypes.string.isRequired
      })
    ).isRequired
  };

  render() {
    const { budget, transactions } = this.props;
    const { categoriesById, categoryGroupsById, id: budgetId } = budget;
    const groups = compose([
      sortBy("amount"),
      mapWithKeys((transactions, groupId) => {
        const group = categoryGroupsById[groupId];
        return {
          group,
          transactions: transactions.length,
          amount: sumBy("amount")(transactions)
        };
      }),
      groupBy(transaction =>
        get([transaction.category_id, "category_group_id"])(categoriesById)
      )
    ])(transactions);
    const total = sumByProp("amount")(groups);

    if (groups.length === 0) {
      return <NoTransactions />;
    }

    return (
      <CollapsibleSection title="Category Groups">
        {groups.map(({ group, transactions, amount }) => (
          <ListItemLink
            key={group.id}
            to={makeLink(pages.currentMonthGroup.path, {
              budgetId,
              categoryGroupId: group.id
            })}
          >
            <LabelWithTransactionCount
              count={transactions}
              label={group.name}
              inLink
            />
            <AmountWithPercentage amount={amount} total={total} />
          </ListItemLink>
        ))}
      </CollapsibleSection>
    );
  }
}

export default CurrentMonthGroupsSection;

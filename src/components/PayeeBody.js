import React, { Fragment, PureComponent } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import compose from "lodash/fp/compose";
import groupBy from "lodash/fp/groupBy";
import map from "lodash/fp/map";
import prop from "lodash/fp/prop";
import sumBy from "lodash/fp/sumBy";
import uniq from "lodash/fp/uniq";
import { getMetadataForPayee, getTransactionMonth } from "../utils";
import TopNumbers from "./TopNumbers";
import PayeeCategories from "./PayeeCategories";
import Breakdown from "./Breakdown";
import Section from "./Section";

const mapWithKeys = map.convert({ cap: false });

class PayeeBody extends PureComponent {
  static propTypes = {
    budget: PropTypes.shape({
      transactions: PropTypes.arrayOf(
        PropTypes.shape({
          payeeId: PropTypes.string.isRequired
        })
      ).isRequired,
      payeesById: PropTypes.object.isRequired
    }).isRequired,
    payee: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  };

  render() {
    const { payee, budget } = this.props;
    const { amount, transactions, transactionCount } = getMetadataForPayee({
      budget,
      payeeId: payee.id
    });
    const transactionsByMonth = groupBy(getTransactionMonth)(transactions);
    const nodes = mapWithKeys((transactions, month) => ({
      amount: sumBy("amount")(transactions),
      id: month,
      name: (
        <span>
          {moment(month).format("MMMM YYYY")}{" "}
          <span style={{ opacity: 0.6 }}>
            &ndash; {transactions.length} transaction{transactions.length === 1
              ? ""
              : "s"}
          </span>
        </span>
      ),
      nodes: transactions.map(transaction => ({
        amount: transaction.amount,
        name: moment(transaction.date).format("dddd, MMMM D"),
        id: transaction.id
      }))
    }))(transactionsByMonth);
    const categoryIds = compose([uniq, map(prop("categoryId"))])(transactions);

    return (
      <Fragment>
        <Section>
          <TopNumbers
            numbers={[
              { label: "total amount", value: Math.abs(amount) },
              {
                label: "transactions",
                value: transactionCount,
                currency: false
              },
              {
                label: "amount/transaction",
                value: Math.abs(amount) / transactionCount
              }
            ]}
          />
        </Section>
        <Section title="Categories">
          <PayeeCategories budget={budget} categoryIds={categoryIds} />
        </Section>
        <Section title="Transactions">
          <Breakdown nodes={nodes} />
        </Section>
      </Fragment>
    );
  }
}

export default PayeeBody;

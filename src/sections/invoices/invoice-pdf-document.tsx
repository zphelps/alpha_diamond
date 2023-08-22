import type {FC} from "react";
import {useMemo} from "react";
import PropTypes from "prop-types";
import {format} from "date-fns";
import numeral from "numeral";
import {useTheme} from "@mui/material/styles";
import {Invoice} from "../../types/invoice.ts";
import ReactPDF, {Document, Image, Page, StyleSheet, Text, View} from "@react-pdf/renderer";
import {useAuth} from "../../hooks/use-auth.ts";
import {Franchise} from "../../types/franchise.ts";
import Font = ReactPDF.Font;

const useStyles = () => {
    const theme = useTheme();

    return useMemo(
        () => {
            return StyleSheet.create({
                page: {
                    backgroundColor: "#FFFFFF",
                    padding: 24
                },
                h4: {
                    fontSize: 14,
                    fontWeight: 600,
                    lineHeight: 1.235
                },
                h6: {
                    fontSize: 12,
                    fontWeight: 600,
                    lineHeight: 1.6
                },
                alignRight: {
                    textAlign: "right"
                },
                subtitle2: {
                    fontSize: 10,
                    fontWeight: 500,
                    lineHeight: 1.57
                },
                body2: {
                    fontSize: 10,
                    fontWeight: 400,
                    lineHeight: 1.43,
                },
                gutterBottom: {
                    marginBottom: 4
                },
                colorSuccess: {
                    color: theme.palette.success.main
                },
                uppercase: {
                    textTransform: "uppercase"
                },
                header: {
                    flexDirection: "row",
                    justifyContent: "space-between"
                },
                brand: {
                    height: 50,
                    width: 95,
                },
                company: {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 32
                },
                references: {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 32
                },
                billing: {
                    marginTop: 32
                },
                items: {
                    marginTop: 32
                },
                itemRow: {
                    borderBottomWidth: 1,
                    borderColor: "#EEEEEE",
                    borderStyle: "solid",
                    flexDirection: "row"
                },
                itemNumber: {
                    padding: 6,
                    width: "10%"
                },
                itemDescription: {
                    padding: 6,
                    width: "50%"
                },
                itemQty: {
                    padding: 6,
                    width: "10%"
                },
                itemUnitAmount: {
                    padding: 6,
                    width: "15%"
                },
                itemTotalAmount: {
                    padding: 6,
                    width: "15%"
                },
                summaryRow: {
                    flexDirection: "row"
                },
                summaryGap: {
                    padding: 6,
                    width: "70%"
                },
                summaryTitle: {
                    padding: 6,
                    width: "15%"
                },
                summaryValue: {
                    padding: 6,
                    width: "15%"
                },
                notes: {
                    marginTop: 32
                }
            });
        },
        [theme]
    );
};

interface InvoicePdfDocumentProps {
    invoice: Invoice;
    franchise: Franchise;
}

export const InvoicePdfDocument: FC<InvoicePdfDocumentProps> = (props) => {
    const {invoice, franchise} = props;
    const styles = useStyles();

    const items = invoice.items || [];
    const dueDate = invoice.due_on && format(Date.parse(invoice.due_on), "MM/dd/yyyy");
    const issueDate = invoice.issued_on && format(Date.parse(invoice.issued_on), "MM/dd/yyyy");
    // const subtotalAmount = numeral(invoice.subtotalAmount).format(`$0,0.00`);
    // const taxAmount = numeral(invoice.taxAmount).format(`$0,0.00`);
    const totalAmount = numeral(invoice.total).format(`$0,0.00`);

    return (
        <Document>
            <Page
                size="A4"
                style={styles.page}
            >
                <View style={styles.header}>
                    <View>
                        <Image
                            source="/src/assets/Logo.png"
                            style={styles.brand}
                        />
                    </View>
                    <View>
                        <Text style={[styles.h4, styles.uppercase, styles.colorSuccess]}>
                            {invoice.status}
                        </Text>
                        <Text style={styles.subtitle2}>
                            {`INV-${invoice.id.split("-").shift().toString().toUpperCase()}`}
                        </Text>
                    </View>
                </View>
                <View style={styles.company}>
                    <View>
                        <Text style={styles.h6}>
                            Billed To
                        </Text>
                        <Text style={styles.body2}>
                            {invoice.client.name}
                        </Text>
                        <Text style={styles.body2}>
                            {invoice.client.billing_location.formatted_address}
                        </Text>
                        <Text style={styles.body2}>
                            {invoice.client.billing_contact.phone}
                        </Text>
                        <Text style={styles.body2}>
                            {invoice.client.billing_contact.email}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.h6}>
                            Payment To
                        </Text>
                        <Text style={styles.body2}>
                            {franchise.legal_name}
                        </Text>
                        <Text style={styles.body2}>
                            {franchise.billing_address}
                        </Text>
                        <Text style={styles.body2}>
                            {franchise.primary_contact.phone_number}
                        </Text>
                        <Text style={styles.body2}>
                            {franchise.primary_contact.email}
                        </Text>
                    </View>
                </View>
                <View style={styles.references}>
                    <View>
                        <Text style={[styles.subtitle2, styles.gutterBottom]}>
                            Due Date
                        </Text>
                        <Text style={styles.body2}>
                            {dueDate}
                        </Text>
                    </View>
                    <View>
                        <Text style={[styles.subtitle2, styles.gutterBottom]}>
                            Issue Date
                        </Text>
                        <Text style={styles.body2}>
                            {issueDate}
                        </Text>
                    </View>
                    <View>
                        <Text style={[styles.subtitle2, styles.gutterBottom]}>
                            Invoice #
                        </Text>
                        <Text style={styles.body2}>
                            {`INV-${invoice.id.split("-").shift().toString().toUpperCase()}`}
                        </Text>
                    </View>
                </View>
                <View style={styles.items}>
                    <View style={styles.itemRow}>
                        <View style={styles.itemNumber}>
                            <Text style={styles.h6}>
                                #
                            </Text>
                        </View>
                        <View style={styles.itemDescription}>
                            <Text style={styles.h6}>
                                Description
                            </Text>
                        </View>
                        <View style={styles.itemQty}>
                            <Text style={styles.h6}>
                                Qty
                            </Text>
                        </View>
                        <View style={styles.itemUnitAmount}>
                            <Text style={styles.h6}>
                                Unit Price
                            </Text>
                        </View>
                        <View style={styles.itemTotalAmount}>
                            <Text style={[styles.h6, styles.alignRight]}>
                                Total
                            </Text>
                        </View>
                    </View>
                    {items.map((item, index) => {
                        const unitAmount = numeral(item.charge_per_unit).format(`$0,0.00`);
                        const totalAmount = numeral(item.total).format(`$0,0.00`);

                        return (
                            <View
                                key={item.id}
                                style={styles.itemRow}
                            >
                                <View style={styles.itemNumber}>
                                    <Text style={styles.body2}>
                                        {index + 1}
                                    </Text>
                                </View>
                                <View style={styles.itemDescription}>
                                    <Text style={styles.body2}>
                                        {item.description}
                                    </Text>
                                </View>
                                <View style={styles.itemQty}>
                                    <Text style={styles.body2}>
                                        {item.num_units ?? "1"}
                                    </Text>
                                </View>
                                <View style={styles.itemUnitAmount}>
                                    <Text style={[styles.body2, styles.alignRight]}>
                                        {unitAmount}
                                    </Text>
                                </View>
                                <View style={styles.itemTotalAmount}>
                                    <Text style={[styles.body2, styles.alignRight]}>
                                        {totalAmount}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                    {/*<View style={styles.summaryRow}>*/}
                    {/*  <View style={styles.summaryGap} />*/}
                    {/*  <View style={styles.summaryTitle}>*/}
                    {/*    <Text style={styles.body2}>*/}
                    {/*      Subtotal*/}
                    {/*    </Text>*/}
                    {/*  </View>*/}
                    {/*  <View style={styles.summaryValue}>*/}
                    {/*    <Text style={[styles.body2, styles.alignRight]}>*/}
                    {/*      {subtotalAmount}*/}
                    {/*    </Text>*/}
                    {/*  </View>*/}
                    {/*</View>*/}
                    {invoice.discount > 0 && <View style={styles.summaryRow}>
                        <View style={styles.summaryGap}/>
                        <View style={styles.summaryTitle}>
                            <Text style={styles.body2}>
                                Discount
                            </Text>
                        </View>
                        <View style={styles.summaryValue}>
                            <Text style={[styles.body2, styles.alignRight]}>
                                {`-$${invoice.discount.toString()}`}
                            </Text>
                        </View>
                    </View>}
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryGap}/>
                        <View style={styles.summaryTitle}>
                            <Text style={styles.body2}>
                                Total
                            </Text>
                        </View>
                        <View style={styles.summaryValue}>
                            <Text style={[styles.body2, styles.alignRight]}>
                                {totalAmount}
                            </Text>
                        </View>
                    </View>
                </View>
                {invoice.summary && <View style={styles.notes}>
                    <Text style={[styles.h6, styles.gutterBottom]}>
                        Notes
                    </Text>
                    <Text style={styles.body2}>
                        {invoice.summary}
                    </Text>
                </View>}
            </Page>
        </Document>
    );
};

InvoicePdfDocument.propTypes = {
    // @ts-ignore
    invoice: PropTypes.object.isRequired
};

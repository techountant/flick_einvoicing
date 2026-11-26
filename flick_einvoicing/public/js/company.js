// Supplier letter: your buyer details for suppliers' e-invoices, printed on your letterhead.
frappe.ui.form.on("Company", {
	refresh(frm) {
		if (frm.is_new()) return;
		frm.add_custom_button(
			__("Supplier Letter"),
			() =>
				frappe.call({ method: "flick_einvoicing.supplier_letter.check", args: { company: frm.doc.name } }).then(({ message: missing }) => {
					const print = (letterhead) =>
						window.open(
							`/printview?doctype=Company&name=${encodeURIComponent(frm.doc.name)}&format=${encodeURIComponent(
								"Supplier E-Invoicing Letter"
							)}&no_letterhead=${letterhead ? 0 : 1}${letterhead ? `&letterhead=${encodeURIComponent(letterhead)}` : ""}`,
							"_blank"
						);
					const open = () =>
						frappe.db.get_value("Letter Head", { is_default: 1, disabled: 0 }, "name").then(({ message }) =>
							frappe.prompt(
								{
									fieldname: "letterhead",
									fieldtype: "Link",
									options: "Letter Head",
									label: __("Letter Head"),
									default: message?.name,
									get_query: () => ({ filters: { disabled: 0 } }),
									description: __("Leave empty to print without a letterhead."),
								},
								(v) => print(v.letterhead),
								__("Supplier Letter"),
								__("Print")
							)
						);
					if (!missing.length) return open();
					frappe.confirm(
						`${__("These will show as not set on the letter:")}<ul>${missing.map((m) => `<li>${frappe.utils.escape_html(m)}</li>`).join("")}</ul>${__(
							"Fill them in on the company (E-Invoicing section) and its address first, or open the letter anyway?"
						)}`,
						open
					);
				}),
			__("E-Invoice")
		);
	},
});

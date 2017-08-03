// Shopify =====================================================================

// Get Shopify Row: returns formatted row to push into CSV
var getShopifyRow = function () {

	// Required Shopify Fields: fields required for import
	const requiredShopifyFields = {
		handle: {
			heading: "Handle",
		},
		title: {
			heading: "Title",
		},
		body: {
			heading: "Body (HTML)",
		},
		vendor: {
			heading: "Vendor",
		},
		type: {
			heading: "Type",
		},
		tags: {
			heading: "Tags",
		},
		published: {
			heading: "Published",
		},
		o1name: {
			heading: "Option1 Name",
		},
		o1value: {
			heading: "Option1 Value",
		},
		o2name: {
			heading: "Option2 Name",
		},
		o2value: {
			heading: "Option2 Value",
		},
		o3name: {
			heading: "Option3 Name",
		},
		o3value: {
			heading: "Option3 Value",
		},
		sku: {
			heading: "Variant SKU",
		},
		grams: {
			heading: "Variant Grams",
		},
		inventory: {
			heading: "Variant Inventory Tracker",
		},
		qty: {
			heading: "Variant Inventory Qty",
		},
		policy: {
			heading: "Variant Inventory Policy",
		},
		fulfillment: {
			heading: "Variant Fulfillment Service",
		},
		price: {
			heading: "Variant Price",
		},
		compare: {
			heading: "Variant Compare At Price",
		},
		requireShipping: {
			heading: "Variant Requires Shipping",
		},
		taxable: {
			heading: "Variant Taxable",
		},
		barcode: {
			heading: "Variant Barcode",
		},
		image: {
			heading: "Image Src",
		},
		alt: {
			heading: "Image Alt Text",
		},
		variantImage: {
			heading: "Variant Image",
		},
		variantWeightUnit: {
			heading: "Variant Weight Unit",
		},
		giftCard: {
			heading: "Gift Card",
		},
		seoTitle: {
			heading: "SEO Title",
		},
		seoDescription: {
			heading: "SEO Description",
		}
	};

	// Optional Shopify Fields: extra fields accepted by import
	const optionalShopifyFields = {
		googleMPN: {
			heading: "Google Shopping / MPN",
		},
		googleAge: {
			heading: "Google Shopping / Age Group",
		},
		googleGender: {
			heading: "Google Shopping / Gender",
		},
		googleCategory: {
			heading: "Google Shopping / Google Product Category",
		},
		googleAdWordsGrouping: {
			heading: "Google Shopping / AdWords Grouping",
		},
		googleAdWordsLabels: {
			heading: "Google Shopping / AdWords Labels",
		},
		googleCondition: {
			heading: "Google Shopping / Condition",
		},
		googleCustom: {
			heading: "Google Shopping / Custom Product",
		},
		googleCustom0: {
			heading: "Google Shopping / Custom Label 0",
		},
		googleCustom1: {
			heading: "Google Shopping / Custom Label 1",
		},
		googleCustom2: {
			heading: "Google Shopping / Custom Label 2",
		},
		googleCustom3: {
			heading: "Google Shopping / Custom Label 3",
		},
		googleCustom4: {
			heading: "Google Shopping / Custom Label 4",
		}
	};

	return clone(requiredShopifyFields);
};

// Start Shopify: gets uploaded CSVs from DOM, parses with PapaParse, sends to formatter
function startShopify() {

    // Get files from DOM
    var productsCSV = document.getElementById("ProductsUpload").files[0];

    // Parse and send to formatter
    Papa.parse(productsCSV, {
        header: true,
    	complete: function(parsedProducts) {
			createShopifyCSV(parsedProducts);
    	}
    });

}

// Create Shopify CSV: converts inventory data to Shopify data
function createShopifyCSV(parsedProducts) {

	// Initialize output
	var output = new Array();

    // Make Shopify headers row, push into output
    var headers = new Array();
	var shopifyHeaders = getShopifyRow();
    for (var key in shopifyHeaders) headers.push(shopifyHeaders[key].heading);
	output.push(headers);

    // Get products array
    var data = parsedProducts.data;

	// Remove META rows
	data = data.splice(2, data.length);

	// Create products array with rows that have a UPC
	var products = new Array();
	for (var i in data) {
		if (data[i].upc) products.push(data[i]);
	}

	console.log(products);

    // // Format parents
    // for (var i in parents) {
	//
    //     // Create outlook block & error flag
    //     var outputBlock = new Array();
	// 	var error = false;
	//
    //     // Initialize parent
    //     var par = parents[i];
	//
    //     // Initialize empty array
    //     var product = new Array(len);
	//
    //     // Create handle
    //     var handle = null;
    //     handle = par.productname.replace(/[^\w\s]/gi, "").replace(/\s+/g, "-").toLowerCase();
	//
    //     // Set parent variables ======================
    //     product[0] = handle; // Handle
    //     product[1] = par.productname; // Title
    //     product[2] = par.productdescription_abovepricing; // Body (HTML)
    //     product[3] = par.productmanufacturer; // Vendor
    //     product[6] = published; // Published
    //     product[24] = par.images[0]; // Image Src (first image)
    //     product[25] = par.photo_alttext; // Image Alt Text
    //     product[31] = par.metatag_title; // SEO Title
    //     product[32] = par.metatag_description; // SEO Description
	//
    //     par.existingchildren = {};
    //     par.hasSize = null;
    //     par.hasColor = null;
	//
    //     // Setup variants =============================
    //     if (par.children && par.children.length > 0) {
	//
    //         // Iterate through children
    //         for (var i in par.children) {
	//
    //             // Initialize child
    //             var child = par.children[i];
	//
    //             // Parse out variant string from title =================================
    //             var parlen = par.productname.length;
    //             var chlen = child.productname.length;
    //             var iden = child.productname.substr(parlen, chlen-1);
	//
    //             // Check for errors, if so, break
    //             if (iden.charAt(0) != " " && iden.charAt(0) != "-") {
    //                 console.log(par.productname+" (Variant parsing error)");
    //                 productError = true;
    //                 break;
    //             }
	//
    //             // Get values from string of variants
    //             var firstString = false;
    //             var firstDivider = false;
    //             var secondString = false;
    //             var sizeIden = "";
    //             var colorIden = "";
    //             for (var j=0; j < iden.length; j++) {
	//
    //                 // Iterate until first string starts
    //                 if (!firstString && !firstDivider && !secondString) {
    //                     if (iden.charAt(j) != " " && iden.charAt(j) != "-") firstString = true;
    //                 }
	//
    //                 // Save characters to sizeIden until dash
    //                 if (firstString && !firstDivider && !secondString) {
    //                     if (iden.charAt(j) != " " && iden.charAt(j) != "-") sizeIden += iden.charAt(j);
    //                     if (iden.charAt(j) == "-") firstDivider = true;
    //                 }
	//
    //                 // Pass over spaces and dashes until other character
    //                 if (firstString && firstDivider && !secondString) {
    //                     if (iden.charAt(j) != " " && iden.charAt(j) != "-") secondString = true;
    //                 }
	//
    //                 // Save characters to colorIden until dash, if dash break
    //                 if (firstString && firstDivider && secondString) {
    //                     if (iden.charAt(j) == "-") break;
    //                     colorIden += iden.charAt(j);
    //                 }
    //             }
	//
    //             // Prevent invalid options child
    //             var childHasSize = (sizeIden != "");
    //             var childHasColor = (colorIden != "") || (colorIden.length < 3);
    //             if (par.hasSize === null) par.hasSize = childHasSize;
    //             if (par.hasColor === null) par.hasColor = childHasColor;
    //             if (par.hasSize != childHasSize || par.hasColor != childHasColor) {
    //                 productError = true;
    //             }
	//
    //             // Prevent duplicate children
    //             var childkey = sizeIden+colorIden;
    //             if (par.existingchildren[childkey]) {
    //                 productError = true;
    //             }
    //             else par.existingchildren[childkey] = true;
	//
    //             // Setup variables
    //             if (!child.saleprice) {
    //                 child.saleprice = child.productprice;
    //                 child.productprice = null;
    //             }
	//
    //             // Add first variant to parent row
    //             if (i == 0) {
    //                 product[7] = "Size"; // Option1 Name
    //                 product[8] = sizeIden; // Option1 Value
    //                 product[9] = "Color"; // Option2 Name
    //                 product[10] = colorIden; // Option3 Value
    //                 product[13] = child.vendor_partno; // Variant SKU
    //                 product[14] = child.productweight*453; // Variant Grams
    //                 product[15] = "shopify"; // Variant Inventory Tracker
    //                 if (!child.stockstatus.length) product[16] = 0;
    //                 else product[16] = child.stockstatus; // Variant Inventory QTY
    //                 product[17] = "deny"; // Variant Inventory Policy
    //                 product[18] = "manual"; // Variant Fulfillment Service
    //                 product[19] = child.saleprice; // Variant Price
    //                 if (child.productprice) product[20] = child.productprice; // Variant Compare at Price
    //                 product[21] = "TRUE"; // Variant Requires Shipping
    //                 product[22] = "TRUE"; // Variant Taxable
	//
    //                 // Push parent row into output
    //                 outputBlock.push(product);
	//
    //             }
	//
    //             // Add other variants to parent row
    //             else {
	//
    //                 // Create row for subproduct
    //                 var subprod = new Array(len);
	//
    //                 // Add variables to row
    //                 subprod[0] = handle;
    //                 subprod[7] = "Size"; // Option1 Name
    //                 subprod[8] = sizeIden; // Option1 Value
    //                 subprod[9] = "Color"; // Option2 Name
    //                 subprod[10] = colorIden; // Option3 Value
    //                 subprod[13] = child.vendor_partno; // Variant SKU
    //                 subprod[14] = child.productweight*453; // Variant Grams
    //                 subprod[15] = "shopify"; // Variant Inventory Tracker
    //                 if (!child.stockstatus.length) subprod[16] = 0;
    //                 else subprod[16] = child.stockstatus; // Variant Inventory QTY
    //                 subprod[17] = "deny"; // Variant Inventory Policy
    //                 subprod[18] = "manual"; // Variant Fulfillment Service
    //                 subprod[19] = child.saleprice; // Variant Price
    //                 if (child.productprice) subprod[20] = child.productprice; // Variant Compare at Price
    //                 subprod[21] = "TRUE"; // Variant Requires Shipping
    //                 subprod[22] = "TRUE"; // Variant Taxable
	//
    //                 // Push subproduct into output
    //                 outputBlock.push(subprod);
    //             }
    //         }
    //     }
	//
    //     // Setup extra images ========================
    //     if (par.images.length > 1) {
    //         for (var i=1; i < par.images.length; i++) {
    //             var image = new Array(len);
    //             image[0] = handle;
    //             image[24] = par.images[i];
    //             outputBlock.push(image);
    //         }
    //     }
	//
    //     // Push output block if no errors
    //     if (!error) for (var i in outputBlock) output.push(outputBlock[i]);
    // }

    // Output link to file
    var shopifyResult = Papa.unparse(output);
    var downloadElement = document.createElement("a");
    downloadElement.href = "data:attachment/text," + encodeURI(shopifyResult);
    downloadElement.download = "PerfectFitShopifyInventory"+Date()+".csv";
	downloadElement.innerHTML = "Download now";
    $("#shopifyOutput").append(downloadElement);
}

// Low Level Functions =========================================================
var objectToArray = function (object) {
	var output = new Array();
	for (var key in object) output.push(object[key]);
	return output;
}
var clone = function (object) {
	return JSON.parse(JSON.stringify(object));
}

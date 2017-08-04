// Shopify =====================================================================

// Get Shopify Row: returns formatted row to push into CSV
var makeShopifyRow = function () {

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
	var shopifyHeaders = makeShopifyRow();
    for (var key in shopifyHeaders) headers.push(shopifyHeaders[key].heading);
	output.push(headers);

	// Setup image column keys
	var imageColumns = ["image1", "image2", "image3", "image4"];

    // Get products array
    var data = parsedProducts.data;

	// Remove META rows
	data = data.splice(2, data.length);

	// Create variants array with rows that have a UPC
	var variants = new Array();
	for (var i in data) {
		if (data[i].upc) variants.push(data[i]);
	}

	// Create products hashmap based on title
	var products = {};
	for (var i in variants) {

		// Determine key for hashmap
		var key = variants[i].title;

		// Create array for product if neccesary
		if (!products[key]) products[key] = new Array();

		// Push variant into product
		products[key].push(variants[i]);
	}

	// For each product...
	for (var key in products) {

		// Initialize product group
		var group = products[key];
		var images = {};

		// Iterate through group to find parent (based on description)
		var parent = null;
		for (var i in group) {
			if (group[i].description) {
				parent = group[i];
				break;
			}
		}

		// Sort group so parent is first
		var sortedGroup = new Array();
		sortedGroup.push(parent);
		for (var i in group) if (parent && group[i].upc != parent.upc) sortedGroup.push(group[i]);
		group = sortedGroup;

		// If no parent, print error with key
		if (!parent) console.log('Error: no parent found for '+key);

		// Otherwise, if parent found, iterate through group and make rows
		else for (var i in group) {

			// Initialize row and variant
			var row = makeShopifyRow();
			var variant = group[i];

			// Make handle
			var handle = parent.title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '-').toLowerCase();

			// Add handle to row
			row.handle.value = handle;

			// Handle parent fields
			if (variant.upc == parent.upc) {

				// Set basic parent variables
				row.title.value = variant.title;
				row.vendor.value = variant.brand;
				row.image.value = variant.mainImage;

				// Setup body
				var body = "";
				body += "<p>"+variant.description+"</p>";
				// Add features
				// Add dimensions
				// Add columns based on value
				row.body.value = body;

				// Setup tags
				row.tags.value = "";

			}

			// Handle fields specifically for non-parents
			else {
				images[variant.mainImage] = true;
			}

			// Handle images
			for (var j in imageColumns) {
				images[variant[imageColumns[j]]] = true;
			}

			// Handle variant options
			var options = [];
			if (variant.size && variant.size != 'N/A') options.push({
				name: 'Size',
				value: variant.size,
			});
			if (variant.color && variant.color != 'N/A') options.push({
				name: 'Color',
				value: variant.color,
			});
			for (var j in options) {
				row['o'+(parseInt(j)+1)+'name'].value = options[j].name;
				row['o'+(parseInt(j)+1)+'value'].value = options[j].value;
			};

			// Handle basic variant values
			row.type.value = parent.category;
			row.sku.value = variant.upc;
			row.barcode.value = variant.upc;
			row.grams.value = ""+parseInt(variant.indPackWeight)*453;
			row.price.value = "9.99";

			// Handle default variant values
			row.published.value = "TRUE";
			row.inventory.value = "shopify";
			row.policy.value = "deny";
			row.qty.value = "50";
			row.fulfillment.value = "manual";
			row.requireShipping.value = "TRUE";
			row.taxable.value = "TRUE";
			row.giftCard.value = "FALSE";

			// Add variant to output
			output.push(rowObjectToArray(row));
		}

		// Setup rows for images
		for (var url in images) {

			// Initialize row and image
			var row = makeShopifyRow();

			// Setup image values
			row.handle.value = handle;
			row.image.value = url;

			// Add image to output
			output.push(rowObjectToArray(row));
		}
	}

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
var rowObjectToArray = function (object) {
	var output = new Array();
	for (var key in object) {
		if (object[key].value) output.push(object[key].value);
		else output.push("");
	}
	return output;
};

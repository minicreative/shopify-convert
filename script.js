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
		},
		googleCategory: {
			heading: "Google Shopping / Google Product Category",
		},
		googleCondition: {
			heading: "Google Shopping / Condition",
		},
	};

	// Remaining Shopify Fields: extra fields accepted by import
	const remainingShopifyFields = {
		googleMPN: {
			heading: "Google Shopping / MPN",
		},
		googleGender: {
			heading: "Google Shopping / Gender",
		},
		googleAge: {
			heading: "Google Shopping / Age Group",
		},
		googleAdWordsGrouping: {
			heading: "Google Shopping / AdWords Grouping",
		},
		googleAdWordsLabels: {
			heading: "Google Shopping / AdWords Labels",
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

// Key lists
const imageColumns = ["image1", "image2", "image3", "image4"];
const detailColumns = {
	warranty: "Warranty",
	care: "Care",
	cordLength: "Cord Length",
	closure: "Closure",
	material: "Material",
	construction: "Construction",
	faceFabric: "Face Fabric",
	reverseFabric: "Reverse Fabric",
	fillType: "Fill",
	skirtFabric: "Skirt Fabric",
	threadCount: "Thread Count",
	pillowMaterial: "Pillow Material",
	pillowShell: "Pillow Shell",
	pillowThreadCount: "Pillow Thread Count",
	pocketDepth: "Pocket Depth",
}
const falseStrings = [null, "", " ", "NO", "no", "NO ", "no ", "n/a", "N/A", "Not a pillow", "Not a Pillow", "NO Warranty"];

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

	// Track categories
	var categories = {};

    // Make Shopify headers row, push into output
	output.push(rowObjectToArray(makeShopifyRow(), 'heading'));

    // Get products array
    var data = parsedProducts.data;

	// Remove META rows
	data = data.splice(2, data.length);

	// Create variants array with rows that have a UPC
	var variants = new Array();
	for (var i in data) {
		if (data[i].upc) variants.push(data[i]);
		else console.log('Error: no UPC in row '+(parseInt(i, 10)+4)); // Throw UPC Error
	}

	// Create products hashmap based on title
	var products = {};
	for (var i in variants) {

		// Determine key for hashmap
		var key = variants[i].pid.substring(0,10);
		if (key.length < 10) console.log('Error: bad PID for '+variants[i].title); // Throw PID Error

		// Create array for product if neccesary
		if (!products[key]) products[key] = new Array();

		// Push variant into product
		products[key].push(variants[i]);
	}

	// For each product...
	for (var key in products) {

		// Initialize product group
		var group = products[key];

		// Initialize arrays and objects for group
		var images = [];
		var colors = {};
		var sizes = {};

		// Iterate through group to find parent & populate sizes & colors
		var parent = null;
		for (var i in group) {

			// Populate colors
			colors[group[i].color] = true;

			// Populate sizes
			if (group[i].size) sizes[group[i].size] = group[i].dimensions;

			// Initialize parent
			if (group[i].description && !parent) parent = group[i];
		}

		// Sort group so parent is first
		var sortedGroup = new Array();
		sortedGroup.push(parent);
		for (var i in group) if (parent && group[i].upc != parent.upc) sortedGroup.push(group[i]);
		group = sortedGroup;

		if (!parent) console.log('Error: no parent found for '+key); // Throw parent error

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

				if (!variant.brand) console.log('Error: brand missing for '+key); // Throw brand error
				if (!variant.category) console.log('Error: category missing for '+key); // Throw category error

				// Track categories
				if (variant.category) {
					if (!categories[variant.category]) categories[variant.category] = [];
					categories[variant.category].push(variant.title);
				}

				// Set basic parent variables
				row.title.value = variant.title;
				row.vendor.value = variant.brand;
				row.image.value = variant.mainImage;

				// Handle images
				for (var j in imageColumns) {
					if (stringToBoolean(variant[imageColumns[j]])) images.push(variant[imageColumns[j]]);
				}

				// Setup body ============================
				var body = "";
				body += "<p>"+variant.description+"</p>";

				// Get array of features
				var features = variant.features.split(new RegExp("\r|\n"));

				// If more than one feature...
				if (features.length > 1) {

					// Open unordered list
					body += "<ul>";

					// For each feature...
					for (var j in features) {

						// Initialize feature
						var feature = features[j];

						// Set k to the first alphanumeric character
						for (var k=0; k<feature.length; k++) if (feature[k].match(/^[0-9a-zA-Z]+$/)) break;

						// Remove non-alphanumeric characters at beginning of string
						feature = feature.substring(k,feature.length);

						// Add bullet to list if feature is correct
						if (feature && feature != "" && feature != " ") {
							body += "<li>"+feature+"</li>";
						}
					}

					// Close unordered list
					body += "</ul>";
				}

				// Pull information from columns
				body += "<p>";
				for (var detailKey in detailColumns) {
					if (stringToBoolean(variant[detailKey]))
						body += "<b>"+detailColumns[detailKey]+":</b> "+variant[detailKey]+"<br />";
				}
				body += "</p>";

				// Print sizes
				if (countKeys(sizes)) {
					body += "<p><b>Sizes</b>:<br />";
					for (var size in sizes) body += "<b>"+size+":</b> "+sizes[size]+"<br />";
					body += "</p>";
				}

				if (stringToBoolean(variant.origin)) body += "<p>Made in "+variant.origin+"</p>";

				// Add body to row
				row.body.value = body;

				// Setup tags =============================
				var tags = [];

				// Tag for brand
				tags.push("Brands_"+variant.brand);

				// Tag for category
				tags.push("Category_"+variant.category);

				// Tag for cushion type
				if (stringToBoolean(parent.cushion)) tags.push("Cushion Type_"+variant.cushion);

				// Tag for fit?

				// Tags for technology
				if (stringToBoolean(parent.heated)) tags.push("Technology_Heated");
				else tags.push("Technology_Non-Heated");
				if (stringToBoolean(parent.cooling)) tags.push("Technology_Cooling");
				if (stringToBoolean(parent.allergy)) tags.push("Technology_Hypoallergenic");
				if (stringToBoolean(parent.waterproof)) tags.push("Technology_Waterproof");

				// Tags for color
				for (var color in colors) tags.push("Color_"+color);

				// Add tags to row
				row.tags.value = "";
				for (var j in tags) {
					row.tags.value += tags[j];
					if (j < tags.length-1) row.tags.value += ",";
				}
			}

			// Handle variant options
			var options = [];
			if (stringToBoolean(variant.size)) options.push({
				name: 'Size',
				value: variant.size,
			});
			if (stringToBoolean(variant.color)) options.push({
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
			row.price.value = variant.price;

			// Handle default variant values
			row.published.value = "TRUE";
			row.inventory.value = "shopify";
			row.policy.value = "deny";
			row.qty.value = "50";
			row.fulfillment.value = "manual";
			row.requireShipping.value = "TRUE";
			row.taxable.value = "TRUE";
			row.giftCard.value = "FALSE";

			// Handle Google Shopping category
			var googleCategory;
			switch(parent.category) {
				case "Accessory": googleCategory = "Home & Garden > Linens & Bedding"; break;
				case "Bedskirt": googleCategory = "Home & Garden > Linens & Bedding > Bedding > Bedskirts"; break;
				case "Blanket": googleCategory = "Home & Garden > Linens & Bedding > Bedding > Blankets"; break;
				case "Furniture Cover": googleCategory = "Home & Garden > Linens & Bedding"; break;
				case "Furniture Protector": googleCategory = "Home & Garden > Linens & Bedding"; break;
				case "Mattress Encasement": googleCategory = "Home & Garden > Linens & Bedding"; break;
				case "Mattress Pad": googleCategory = "Home & Garden > Linens & Bedding > Bedding > Mattress Protectors > Mattress Pads"; break;
				case "Pillow": googleCategory = "Home & Garden > Linens & Bedding > Bedding > Pillows"; break;
				case "Pillow Cover": googleCategory = "Home & Garden > Linens & Bedding > Bedding > Pillowcases & Shams"; break;
				case "Throw": googleCategory = "Home & Garden > Linens & Bedding > Bedding > Blankets"; break;
			}
			if (googleCategory) row.googleCategory.value = googleCategory;

			// Handle Google Shopping condition field
			row.googleCondition.value = "new";

			// Add variant to output
			output.push(rowObjectToArray(row));
		}

		// Setup rows for images
		for (var i in images) {

			// Initialize row and image
			var row = makeShopifyRow();

			// Setup image values
			row.handle.value = handle;
			row.image.value = images[i];

			// Add image to output
			output.push(rowObjectToArray(row));
		}
	}

	// Print categories
	console.log('Categories processed:');
	console.log(categories);

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
var rowObjectToArray = function (object, objectKey) {

	// Setup key
	if (!objectKey) objectKey = "value";

	// Setup row array
	var output = new Array();
	for (var key in object) {
		if (object[key][objectKey]) output.push(object[key][objectKey]);
		else output.push("");
	}
	return output;
};
var stringToBoolean = function (string) {
	for (var i in falseStrings) if (string == falseStrings[i]) return false;
	return true;
}
var countKeys = function (object) {
	var count = 0;
	for (var key in object) if (object.hasOwnProperty(key)) count++;
	return count;
};

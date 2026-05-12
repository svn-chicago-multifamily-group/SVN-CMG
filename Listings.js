const PropertyUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSCCuImFnIehsz8VvbM4F07jZwCClRUukR1cLBb_X_fR7jEckxqAfrOY7HUXe3JGbXYbuEyd_b3cZ-B/pub?output=csv";

async function loadListings(){
    try{
        const response = await fetch(PropertyUrl);
        const data = await response.text();
        console.log('Fetched CSV data:', data);

        // Use PapaParse to parse CSV
        const parsed = Papa.parse(data, {header: false});
        const rows = parsed.data;
        console.log('Parsed rows:', rows);

        //identifiy the "buckets" in your HTML
        const activeContainer = document.getElementById('active-listings');
        const soldContainer = document.getElementById('sold-listings');

        //Clear existing content
        activeContainer.innerHTML = "";
        soldContainer.innerHTML = "";

        //Loop through data (starting at index 1 to skip headers)
        for (let i = 1; i < rows.length; i++){
            const columns = rows[i];
            console.log(`Row ${i} columns:`, columns);

            //Safety Check: Skip if row is empty
            if (!columns || columns.length < 8) continue;

            //Mapping the Columns (make sure the Google Sheet is in this order)
            const propertyName = columns[0].trim(); // A: Property Name
            const address = columns[1].trim(); // B: Address
            const price = columns[2].trim(); // C: Price or subject to offer
            const sizeSF = columns[3].trim(); // D: Square Footage
            const units = columns[4].trim(); // E: Unit Count
            const photo = columns[5].trim(); // F: link to image
            let link = columns[6].trim(); // Buildout link
            const status = columns[7].trim().toLowerCase(); // Status
            const isValidUrl = /^https?:\/\//i.test(link);
            console.log(`Link for ${propertyName}:`, link, 'Valid URL:', isValidUrl);
            console.log(`Property: ${propertyName}, Status: ${status}`);
            // Only use link if valid URL
            let linkHtml = '';
            if (isValidUrl) {
                linkHtml = `<a href="${link}" target="_blank" class="om-btn">${status === 'sold'? 'View Record': 'View Full Listing'}</a>`;
            } else {
                linkHtml = '';
            }

            //Card template
            const cardHtml =`<div class="property-card">
                <div class="prop-card-img">
                    <img src="${photo}" alt= "picture of ${propertyName}">
                </div>
                <div class="prop-card">
                    <h3 class="prop-name">${propertyName}</h3>
                    <p class="prop-address">${address}</p>
                    <div class="prop-specs"> 
                        <span>${sizeSF}</span> | <span>${units}</span>
                    </div>
                    <p class="prop-price">${status === 'sold'? 'SOLD' : price}</p>
                    ${linkHtml}
                </div>
            </div>`;

            //Sorting logic
            if (status === 'for sale' || status === 'offer made') {
                activeContainer.innerHTML += cardHtml;
            } else if (status === 'sold') {
                soldContainer.innerHTML += cardHtml;
            }
            // Hidden statues is ignored, so it won't show up
        }
    }
    catch (error){
        console.error("Error loading the spreadsheet:", error);
    }
}

// Start the function
loadListings();
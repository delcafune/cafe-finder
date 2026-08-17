function getLocation() {
    navigator.geolocation.getCurrentPosition(showPosition);
}

async function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);

    const { Place } =
        await google.maps.importLibrary("places");
    
    const request = {
        fields: ["displayName", "formattedAddress", "rating", "photos"],
        locationRestriction: {
            center: {
                lat: latitude,
                lng: longitude
            },
            radius: 2000
        },
        includedPrimaryTypes: ["cafe"],
        maxResultCount: 10,
    };

    const { places } = await Place.searchNearby(request);

    const cards = document.querySelector(".cards");

    cards.innerHTML = "";

    places.forEach(place => {
        const cafeName = place.displayName;
        const cafeAddress = place.formattedAddress;
        const cafeRating = place.rating;
        const cafePhoto = place.photos?.[0];

        const photoURL = cafePhoto
            ? cafePhoto.getURI({ maxWidth: 500 })
            : null;

        cards.innerHTML += `
            <div class="card">

                ${photoURL
                    ? `<img src="${photoURL}" alt="${cafeName}" class="cafe-photo">`
                    : `<div class="no-photo">☕</div>`
                }

                <h3>${cafeName}</h3>
                <p>📍 ${cafeAddress}</p>
                <p>⭐ ${cafeRating ?? "No rating yet"}</p>
            </div>
        `;
    });
}
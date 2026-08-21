let cafes = [];
let currentCafeIndex = 0;

function getLocation() {
    const cards = document.querySelector(".cards");
    cards.innerHTML = "<p>Finding cafes near you... ☕</p>";

    navigator.geolocation.getCurrentPosition(showPosition, showError);
}

function showError(error) {
    const cards = document.querySelector(".cards");

    if (error.code === 1) {
        cards.innerHTML = "<p>Location access was denied. Please allow location access and try again.</p>";
    } else if (error.code === 2) {
        cards.innerHTML = "<p>Your location is currently unavailable. Please try again.</p>";
    } else if (error.code === 3) {
        cards.innerHTML = "<p>Getting your location took too long. Please try again.</p>";
    } else {
        cards.innerHTML = "<p>Unable to get your location. Please try again.</p>";
    }
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
        rankPreference: "DISTANCE"
    };

    const { places } = await Place.searchNearby(request);

    cafes = places;
    currentCafeIndex = 0;

    showCafe();
}

function showCafe() {
    const cards = document.querySelector(".cards");

    cards.innerHTML = "";

    const place = cafes[currentCafeIndex];

    const cafeName = place.displayName;
    const cafeAddress = place.formattedAddress;
    const cafeRating = place.rating;
    const cafePhoto = place.photos?.[0];

    const photoURL = cafePhoto
        ? cafePhoto.getURI({ maxWidth: 500 })
        : null;

    cards.innerHTML = `
        <div class="card" id="swipe-card">

            ${photoURL
                ? `<img src="${photoURL}" alt="${cafeName}" class="cafe-photo">`
                : `<div class="no-photo">☕</div>`
            }

            <h3>${cafeName}</h3>
            <p>📍 ${cafeAddress}</p>
            <p>⭐ ${cafeRating ?? "No rating yet"}</p>

            <button class="save-btn" onclick='saveCafe(${JSON.stringify({
                name: cafeName,
                address: cafeAddress,
                rating: cafeRating,
                photo: photoURL
            })})'>
                Save Cafe
            </button>

            <button class="skip-btn" onclick="nextCafe()">
                Skip Cafe
            </button>
        </div>
    `;
    setupSwipe();
}

function setupSwipe() {
    const card = document.querySelector("#swipe-card");

    let startX = 0;
    let currentX = 0;
    let dragging = false;

    card.addEventListener("pointerdown", event => {
        startX = event.clientX;
        dragging = true;

        card.style.transition = "none";

        card.setPointerCapture(event.pointerId);
    });

    card.addEventListener("pointermove", event => {
        if (!dragging) return;

        currentX = event.clientX - startX;

        const rotation = currentX / 15;

        card.style.transform =
            `translateX(${currentX}px) rotate(${rotation}deg)`;
    });

    card.addEventListener("pointerup", () => {
        dragging = false;

        if (currentX > 100) {
            card.style.transition = "transform 180ms cubic-bezier(0.22, 0.61, 0.36, 1)";
            card.style.transform = "translateX(500px) rotate(18deg)";

            setTimeout(() => {
                const place = cafes[currentCafeIndex];

                const cafePhoto = place.photos?.[0];
                const photoURL = cafePhoto
                    ? cafePhoto.getURI({maxWidth: 500 })
                    : null;

                saveCafe({
                    name: place.displayName,
                    address: place.formattedAddress,
                    rating: place.rating,
                    photo: photoURL
                });
            }, 180);

        } else if (currentX < -100) {
            card.style.transition = "transform 180ms cubic-bezier(0.22, 0.61, 0.36, 1)";
            card.style.transform = "translateX(-500px) rotate(-18deg)";

            setTimeout(() => {
                nextCafe();
            }, 180);

        } else {
            card.style.transition = "transform 180ms cubic-bezier(0.22, 0.61, 0.36, 1)";
            card.style.transform = "translateX(0) rotate(0deg)";
        }
    });
}

function nextCafe() {
    currentCafeIndex++;

    if (currentCafeIndex >= cafes.length) {
        const cards = document.querySelector(".cards");
        cards.innerHTML = "<p>No more cafes nearby ☕</p>";
        return;
    }

    showCafe();
}

function saveCafe(cafe) {
        const savedCafes = 
            JSON.parse(localStorage.getItem("savedCafes")) || [];

        const alreadySaved = savedCafes.some(savedCafe =>
            savedCafe.name === cafe.name &&
            savedCafe.address === cafe.address
        );

        if (alreadySaved) {
            nextCafe();
            return;
        }

        savedCafes.push(cafe);

        localStorage.setItem("savedCafes", JSON.stringify(savedCafes));

        nextCafe();
}

function showSaved() {
    const savedCafes =
        JSON.parse(localStorage.getItem("savedCafes")) || [];
    
    const cards = document.querySelector(".cards");

    cards.innerHTML = "";

    if (savedCafes.length === 0) {
        cards.innerHTML = "<p>No saved cafes yet ☕</p>";
        return;
    }

    savedCafes.forEach(cafe => {
        cards.innerHTML += `
            <div class="card">
                ${cafe.photo
                    ? `<img src="${cafe.photo}" alt="${cafe.name}" class="cafe-photo">`
                    : `<div class="no-photo">☕</div>`
                }

                <h3>${cafe.name}</h3>
                <p>📍 ${cafe.address}</p>
                <p>⭐ ${cafe.rating ?? "No rating yet"}</p>

                <button class="remove-btn" onclick='removeCafe(${JSON.stringify(cafe)})'>
                    Remove Cafe
                </button>
            </div>
        `;
    });
}
function removeCafe(cafe) {
    let savedCafes =
        JSON.parse(localStorage.getItem("savedCafes")) || [];

    savedCafes = savedCafes.filter(savedCafe =>
        !(
            savedCafe.name === cafe.name &&
            savedCafe.address === cafe.address
        )
    );

    localStorage.setItem("savedCafes", JSON.stringify(savedCafes));

    showSaved();
}
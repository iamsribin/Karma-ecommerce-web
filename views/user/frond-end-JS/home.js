
const logoutLink = document.querySelector(".logoutLink");

logoutLink.addEventListener("click", async (event) => {
    event.preventDefault();
    Swal.fire({
        title: "Are you sure?",
        text: "Do you want to logout?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Logout!"
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: "Successfully logged out",
                icon: "success",
                showCancelButton: false,
                confirmButtonColor: "#3085d6",
                confirmButtonText: "OK",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const response = await fetch("/auth/logout", {
                        method: "POST",
                    });
                    if (response.redirected) {
                        window.location.href = response.url;
                    }
                }
            });
        }
    });
});



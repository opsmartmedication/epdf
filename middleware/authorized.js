export default function ({ $auth, route, redirect, $axios }) {
 
  const isCRoute = route.path === "/document/confirmation";
  const isVRoute = route.path === "/document/view";
  const isIRoute = route.path === "/document";

  const isExtRoute = route.path.includes('/document/ext/');

  console.log(isCRoute)
  // Simply checks if user has the permission to access that route
  // user gets logged out if user has the false role

  if ($auth.loggedIn) {
    if (isCRoute || isVRoute || isIRoute || isExtRoute) {
        console.log("NO USER")
      return;
    } else {
      if (!$auth.user) {
        $axios
          .get("/user")
          .then(async (resp) => {
            let user = resp.data;
            if (user.role !== "Pharmacist" && user.role !== "Admin") {
              console.log("First logout")
              await $auth.logout();
            }
          })
          .catch(async (error) => {
      
            console.log(error);
          });
      } else {
        let user = $auth.user;
        if (user.role !== "Pharmacist" && user.role !== "Admin") {
          console.log("Second logout")

          $auth.logout();
        }
      }
   
    }
  }
}

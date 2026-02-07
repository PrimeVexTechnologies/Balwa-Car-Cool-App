import { Redirect } from "expo-router";

<<<<<<< HEAD
const isLoggedIn = true; 
=======
const isLoggedIn = true;
>>>>>>> 09395ca (Initial project setup)

export default function Index() {
  return isLoggedIn
    ? <Redirect href="/dashboard" />
    : <Redirect href="/login" />;
}

<<<<<<< HEAD
=======
// import { supabase } from "@/lib/supabase";
// import { Redirect } from "expo-router";
// import { useEffect, useState } from "react";

// export default function Index() {
//   const [loading, setLoading] = useState(true);
//   const [loggedIn, setLoggedIn] = useState(false);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data }) => {
//       setLoggedIn(!!data.session);
//       setLoading(false);
//     });
//   }, []);

//   if (loading) return null;

//   return loggedIn ? <Redirect href="/dashboard" /> : <Redirect href="/login" />;
// }
>>>>>>> 09395ca (Initial project setup)

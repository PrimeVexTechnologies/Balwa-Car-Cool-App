import { Redirect } from "expo-router";

const isLoggedIn = true; // TEMP (later from Supabase)

export default function Index() {
  return isLoggedIn
    ? <Redirect href="/dashboard" />
    : <Redirect href="/login" />;
}


// import { ScrollView, View } from "react-native";

// import Hero from "@/components/landing/Hero";
// import About from "@/components/landing/About";
// import Services from "@/components/landing/Services";
// import Contact from "@/components/landing/Contact";
// import Footer from "@/components/landing/Footer";

// export default function HomeScreen() {
//   return (
//     <ScrollView style={{ flex: 1 }}>
//       <View>
//         <Hero />
//         <About />
//         <Services />
//         <Contact />
//         <Footer />
//       </View>
//     </ScrollView>
//   );
// }

import PageShell from "../components/PageShell";
import HeroCarousel from "../components/HeroCarousel";
import SearchBar from "../components/SearchBar";
import SobreHotel from "../components/SobreHotel";
import Amenidades from "../components/Amenidades";
import DayPass from "../components/DayPass";
import HabitacionesDestacadas from "../components/HabitacionesDestacadas";

export default function Home() {
  return (
    <PageShell>
      <HeroCarousel />
      <SearchBar />
      <SobreHotel />
      <Amenidades />
      <DayPass />
      <HabitacionesDestacadas />
    </PageShell>
  );
}

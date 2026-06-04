export interface Project {
  id: string | number;
  title: string;
  category: string;
  desc: string;
  image: string;
  longDesc?: string;
  objective?: string;
  artDirection?: string;
  transition_type?: "glass" | "sword" | "glitch";
  title_color?: string;
  accent_color?: string;
  font_family?: string;
}

export const projects: Project[] = [
  {
    id: "1",
    title: "Lilac Editorial",
    category: "High-Fidelity Branding",
    desc: "Luxury editorial design for high-end fashion brands.",
    image: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop",
    longDesc: "This project explored the intersection of high-fashion and digital minimalism. We used lilac as a primary brand color to evoke a sense of modern luxury and editorial grace.",
    objective: "Create an immersive brand identity that feels like a physical magazine.",
    artDirection: "Minimalist layout with bold typography and radical color gradients.",
    transition_type: "glass",
    title_color: "#FFFFFF",
    accent_color: "#A855F7",
    font_family: "font-syne"
  },
  {
    id: "2",
    title: "Digital Canvas",
    category: "Interactive Art",
    desc: "An immersive digital gallery experience.",
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop",
    longDesc: "Digital Canvas is a platform for generative artists to showcase their work in a spatial environment. The interface itself is a piece of art, responding to every user interaction.",
    objective: "Build a gallery that feels as fluid and alive as the art it contains.",
    artDirection: "Fluid motion, glassmorphism, and spatial depth.",
    transition_type: "sword",
    title_color: "#FFFFFF",
    accent_color: "#A855F7",
    font_family: "font-syne"
  },
  {
    id: "3",
    title: "Ethereal Bloom",
    category: "Product Design",
    desc: "Clean and organic product interfaces.",
    image: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=1917&auto=format&fit=crop",
    longDesc: "Ethereal Bloom is a concept for a organic skincare brand. The UI uses soft curves and light-reactive shaders to communicate the gentleness of the products.",
    objective: "Translate tactile organic sensations into a digital interface.",
    artDirection: "Soft lighting, organic curves, and ethereal gradients.",
    transition_type: "glitch",
    title_color: "#FFFFFF",
    accent_color: "#A855F7",
    font_family: "font-syne"
  },
  {
    id: "4",
    title: "Vortex Motion",
    category: "Motion Graphics",
    desc: "High-energy animations for digital displays.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
    longDesc: "Vortex Motion pushes the boundaries of web-based motion graphics. Every element in this project is calculated in real-time, creating a mesmerizing loop of light and energy.",
    objective: "Push the limits of real-time web animation and visual complexity.",
    artDirection: "Kinetic energy, neon accents, and dark high-contrast layouts.",
    transition_type: "glass",
    title_color: "#FFFFFF",
    accent_color: "#A855F7",
    font_family: "font-syne"
  }
];

import { Prism } from "prism-react-renderer";

// Extra Prism language files (from the prismjs package) register themselves
// on a global `Prism`. Point it at the instance prism-react-renderer uses.
(globalThis as { Prism?: typeof Prism }).Prism = Prism;

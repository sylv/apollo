import { IMDB } from "@ryanke/imdb-api";
import mem from "mem";

const imdb = new IMDB();
export const lookup = mem(imdb.search);

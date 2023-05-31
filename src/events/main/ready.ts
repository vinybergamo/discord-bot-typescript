import { Event } from "../../struct/types/Event";

export default new Event({
  name: "ready",
  once: true,
  run(...args) {},
});

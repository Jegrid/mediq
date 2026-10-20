//join class names together, skips any falsy ones
export default function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

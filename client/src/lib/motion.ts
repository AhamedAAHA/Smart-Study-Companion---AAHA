export const fadeUp = {
  hidden: { opacity: 0, transform: "translateY(24px)" },
  visible: { opacity: 1, transform: "translateY(0)" },
};

export const stagger = (delay = 0.08) => ({
  hidden: {},
  visible: { transition: { staggerChildren: delay } },
});

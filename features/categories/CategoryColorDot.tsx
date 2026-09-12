import styles from "./CategoriesPage.module.css"

interface CategoryColorDotProps {
  color: string
}

export function CategoryColorDot({ color }: CategoryColorDotProps) {
  // Generate style attribute with CSS custom property for dynamic color
  // eslint-disable-next-line @next/next/no-inline-styles
  const styleObj: React.CSSProperties = {
    "--color": color,
  } as React.CSSProperties

  return (
    // eslint-disable-next-line @next/next/no-inline-styles
    <div
      className={styles.categoryColorDot}
      style={styleObj}
    />
  )
}

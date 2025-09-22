// Simple replacement for class-variance-authority
export type VariantProps<T extends (...args: any) => any> = Omit<Parameters<T>[0], "className">

export type ClassValue = string | number | boolean | undefined | null | ClassValue[]

export interface VariantConfig {
  variants?: Record<string, Record<string, string>>
  defaultVariants?: Record<string, string>
}

export function cva(base: string, config?: VariantConfig): (props?: Record<string, any>) => string {
  return (props: Record<string, any> = {}): string => {
    let classes = base

    if (config?.variants) {
      for (const [key, value] of Object.entries(props)) {
        if (config.variants[key] && config.variants[key][value]) {
          classes += ` ${config.variants[key][value]}`
        }
      }
    }

    if (config?.defaultVariants) {
      for (const [key, defaultValue] of Object.entries(config.defaultVariants)) {
        if (!(key in props) && config.variants?.[key]?.[defaultValue]) {
          classes += ` ${config.variants[key][defaultValue]}`
        }
      }
    }

    return classes
  }
}

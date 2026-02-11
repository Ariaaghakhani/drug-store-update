export default defineAppConfig({
  ui: {
    colors: {
      primary: 'brand',
      secondary: 'secondary',
      info: 'info',
      warning: 'warning',
      success: 'success',
      danger: 'danger',
    },
    toast: {
      slots: {
        root: 'relative group overflow-hidden bg-default shadow-lg rounded-lg ring ring-default p-4 flex flex-row-reverse gap-2.5 focus:outline-none', // Added flex-row-reverse
        wrapper: 'w-0 flex-1 flex flex-col',
        title: 'text-sm font-medium font-dana text-highlighted text-end', // Added text-right
        description: 'text-sm text-muted text-end font-dana', // Added text-right
        icon: 'shrink-0 size-5',
        avatar: 'shrink-0',
        avatarSize: '2xl',
        actions: 'flex gap-1.5 shrink-0',
        progress: 'absolute inset-x-0 bottom-0',
        close: 'p-0',
      },
    },
    variants: {
      color: {
        primary: {
          root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-brand-500)]',
          icon: 'text-[var(--color-brand-500)]',
        },
        success: {
          root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-success)]',
          icon: 'text-[var(--color-success)]',
        },
        info: {
          root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-info)]',
          icon: 'text-[var(--color-info)]',
        },
        warning: {
          root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-warning)]',
          icon: 'text-[var(--color-warning)]',
        },
        danger: {
          root: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-danger)]',
          icon: 'text-[var(--color-danger)]',
        },
      },
    },
    modal: {
      slots: {
        header: 'flex items-center justify-between',
        title: 'text-right order-2 font-dana',
        close: 'order-1 relative left-auto right-auto top-0',
        body: 'text-right font-dana',
        footer: 'text-right order-3 font-dana flex-row-reverse',
      },
    },
  },
})

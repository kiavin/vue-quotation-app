<script setup lang="ts">
import { cva } from 'class-variance-authority'
import { cn } from '@/utils/utils'
import { Badge } from '@/components/ui/badge'

const badgeVariants = cva(
  '',
  {
    variants: {
      status: {
        draft: 'bg-slate-100 text-slate-700 border-slate-200',
        sent: 'bg-sky-100 text-sky-700 border-sky-200',
        approved: 'bg-green-100 text-green-700 border-green-200',
        rejected: 'bg-red-100 text-red-700 border-red-200',
        expired: 'bg-amber-100 text-amber-700 border-amber-200',
      },
    },
    defaultVariants: {
      status: 'draft',
    },
  },
)

interface Props {
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
  class?: string
}

defineProps<Props>()
</script>

<template>
  <Badge :class="cn(badgeVariants({ status }), 'capitalize')" variant="outline">
    {{ status }}
  </Badge>
</template>

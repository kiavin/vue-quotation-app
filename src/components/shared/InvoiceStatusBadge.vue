<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'

const props = defineProps<{
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void'
}>()

const statusConfig = computed(() => {
  switch (props.status) {
    case 'draft':
      return { variant: 'secondary' as const, label: 'Draft' }
    case 'sent':
      return { variant: 'outline' as const, label: 'Sent' }
    case 'paid':
      return { variant: 'success' as const, label: 'Paid' }
    case 'overdue':
      return { variant: 'destructive' as const, label: 'Overdue' }
    case 'void':
      return { variant: 'outline' as const, label: 'Void' }
    default:
      return { variant: 'secondary' as const, label: props.status }
  }
})
</script>

<template>
  <Badge :variant="statusConfig.variant">
    {{ statusConfig.label }}
  </Badge>
</template>

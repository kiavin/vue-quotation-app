<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { Plus, Minus } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/utils'
import type { HTMLAttributes } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: number
  min?: number
  max?: number
  step?: number
  class?: HTMLAttributes['class']
}>(), {
  modelValue: 0,
  min: 0,
  step: 1
})

const emits = defineEmits<{
  (e: 'update:modelValue', payload: number): void
}>()

const value = useVModel(props, 'modelValue', emits)

const handleIncrement = () => {
  if (props.max !== undefined && value.value >= props.max) return
  value.value = Number((value.value + props.step).toFixed(10))
}

const handleDecrement = () => {
  if (props.min !== undefined && value.value <= props.min) return
  value.value = Number((value.value - props.step).toFixed(10))
}
</script>

<template>
  <div :class="cn('flex items-center gap-1', props.class)">
    <Button 
      type="button" 
      variant="outline" 
      size="icon" 
      class="h-10 w-10 shrink-0 rounded-r-none border-r-0 focus:z-10"
      @click="handleDecrement"
      :disabled="min !== undefined && value <= min"
    >
      <Minus class="h-4 w-4" />
    </Button>
    <Input 
      v-model.number="value"
      type="number"
      inputmode="decimal"
      :min="min"
      :max="max"
      :step="step"
      class="h-10 rounded-none text-center focus:z-10"
    />
    <Button 
      type="button" 
      variant="outline" 
      size="icon" 
      class="h-10 w-10 shrink-0 rounded-l-none border-l-0 focus:z-10"
      @click="handleIncrement"
      :disabled="max !== undefined && value >= max"
    >
      <Plus class="h-4 w-4" />
    </Button>
  </div>
</template>

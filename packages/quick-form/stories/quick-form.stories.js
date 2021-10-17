import ELQuickForm from '../src/quick-form.vue'

export default {
  title: 'ELQuickForm',
  component: ELQuickForm
}

export const QuickForm = _ => ({
  components: { ELQuickForm },
  template: `
    <div>
      <el-quick-form></el-quick-form>
    </div>
  `
})

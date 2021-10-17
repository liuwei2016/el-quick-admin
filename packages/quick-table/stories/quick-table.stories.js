import LgQuickTable from '../src/quick-table.vue'

export default {
  title: 'LgQuickTable',
  component: LgQuickTable
}

export const QuickTable = _ => ({
  components: { LgQuickTable },
  template: `
    <div>
      <ELquick-table></ELquick-table>
    </div>
  `
})
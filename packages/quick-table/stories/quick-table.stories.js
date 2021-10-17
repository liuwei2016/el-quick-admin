import LgQuickTable from '../src/quick-table.vue'

export default {
  title: 'LgQuickTable',
  component: LgQuickTable
}

export const QuickTable = _ => ({
  components: { LgQuickTable },
  template: `
    <div>
      <lg-quick-table></lg-quick-table>
    </div>
  `
})
<template>
  <div class="app-container">
    <div class="filter-container">
      商品名称:
      <el-input v-model="listQuery.goodsName" placeholder="商品名称" style="width: 190px; margin-right: 20px" class="filter-item" @keyup.enter.native="handleFilter" />
      用户名:
      <el-input v-model="listQuery.userName" placeholder="用户名" style="width: 190px;  margin-right: 20px" class="filter-item" @keyup.enter.native="handleFilter" />
      手机号:
      <el-input v-model="listQuery.phoneNo" placeholder="手机号" style="width: 190px;  margin-right: 20px" class="filter-item" @keyup.enter.native="handleFilter" />
      快递单号:
      <el-input v-model="listQuery.phyNum" placeholder="快递单号" style="width: 190px;  margin-right: 20px" class="filter-item" @keyup.enter.native="handleFilter" />
      订单号:
      <el-input v-model="listQuery.orderNo" placeholder="订单号" style="width: 190px;  margin-right: 20px" class="filter-item" @keyup.enter.native="handleFilter" />
      <!--      <el-select v-model="listQuery.importance" placeholder="订单状态" clearable style="width: 90px" class="filter-item">-->
      <!--        <el-option v-for="item in importanceOptions" :key="item" :label="item" :value="item" />-->
      <!--      </el-select>-->
      订单状态:
      <el-select v-model="listQuery.order_status" placeholder="订单状态" clearable class="filter-item" style="width: 150px; margin-right: 30px">
        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name+'('+item.key+')'" :value="item.key" />
      </el-select>
      <!--      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">-->
      <!--        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />-->
      <!--      </el-select>-->
      订单更新时间:
      <el-date-picker v-model="listQuery.orderTime" type="datetime" placeholder="请选择订单时间" />
      -
      <el-date-picker v-model="temp.timestamp" type="datetime" value-format="yyyy-MM-dd HH:mm" format="yyyy-MM-dd HH:mm" placeholder="请选择订单时间" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item " type="primary" icon="el-icon-upload2" @click="handleDownload">
        导出到表格
      </el-button>
      <upload-excel-component :on-success="handleSuccess" :before-upload="beforeUpload" />
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column type="selection" align="center" />
      <el-table-column label="订单ID" prop="id" sortable="custom" align="center" width="250" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.orderNo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下单时间" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="用户名称" min-width="190px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户手机号" width="180px" align="center">
        <template slot-scope="{row}">
          <span style="color:red;">{{ row.phoneNo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单价格" align="center" width="95">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.payMoney }}</span>
        </template>
      </el-table-column>
      <el-table-column label="物流单号" align="center" width="150">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.phyNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" class-name="status-col" width="150">
        <template slot-scope="{row}">
          <el-tag :type="row.orderStatus | statusFilter">
            {{ row.orderStatus }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" width="250px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="300" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            详情
          </el-button>
          <el-button size="mini" type="success" @click="handleLogistics(row)">
            物流状态
          </el-button>
          <el-button size="mini" type="warning" @click="handleBeizhu(row,$index)">
            审批
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleBeizhu(row,$index)">
            备注
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" label-position="left" label-width="140px" style="width: 90%; padding:0 5%; height: 80%" class="elform">
        <el-form-item label="订单编号" prop="type" style="width: 45%; margin-right: 5%">
          {{ infoList.orderVO.orderNo }}
        </el-form-item>
        <el-form-item label="下单时间" prop="timestamp" style="width: 50%;">
          {{ infoList.orderVO.orderTime }}
        </el-form-item>
        <el-form-item label="订单主状态" prop="type" style="width: 45%; margin-right: 5%">
          {{ infoList.orderVO.orderStatus }}
        </el-form-item>
        <el-form-item label="快递单号" prop="timestamp" style="width: 50%;">
          {{ infoList.orderVO.phyNum }}
        </el-form-item>
        <el-form-item label="支付总金额" prop="type" style="width: 45%; margin-right: 5%">
          {{ infoList.orderVO.payMoney }}
        </el-form-item>
        <el-form-item label="支付流水号" prop="timestamp" style="width: 50%;" />
        <el-form-item label="商品总金额" prop="type" style="width: 45%; margin-right: 5%">
          {{ infoList.orderVO.payMoney }}
        </el-form-item>
        <el-form-item label="快递费" prop="timestamp" style="width: 50%;">
          {{ infoList.orderVO.orderTime }}
        </el-form-item>
        <el-form-item label="用户名" prop="type" style="width: 45%; margin-right: 5%">
          {{ infoList.orderVO.nickname }}
        </el-form-item>
        <el-form-item label="用户手机号" prop="timestamp" style="width: 50%;">
          {{ infoList.orderVO.phoneNo }}
        </el-form-item>
        <el-form-item label="收货人" prop="type" style="width: 45%; margin-right: 5%">
          {{ infoList.address.name }}
        </el-form-item>
        <el-form-item label="收货手机号" prop="timestamp" style="width: 50%;">
          {{ infoList.address.phoneNo }}
        </el-form-item>
        <el-form-item label="收货地址" prop="type" style="width: 45%; margin-right: 5%">
          {{ infoList.address.city }}{{ infoList.address.district }} {{ infoList.address.address }}
        </el-form-item>
        <el-form-item label="备注" prop="timestamp" style="width: 50%;">
          {{ infoList.orderVO.remark }}
        </el-form-item>
        <el-form-item label="商品列表" :modal="infoList.orderGoods" style="width: 100%">
          <el-table :data="infoList.orderGoods">
            <el-table-column property="goodsName" label="商品名称" width="150">
              <template slot-scope="{row}">
                <span>{{ row.goodsName }}</span>
              </template>
            </el-table-column>
            <el-table-column property="goodsPrice" label="商品价格" width="200">
              <template slot-scope="{row}">
                <span>{{ row.goodsPrice }}</span>
              </template>
            </el-table-column>
            <el-table-column property="num" label="商品数量">
              <template slot-scope="{row}">
                <span>{{ row.num }}</span>
              </template>
            </el-table-column>
          </el-table>

        </el-form-item>
        <el-form-item label="取消订单申请" prop="timestamp" style="width: 100%;">
          <div v-if="infoList.orderVO.orderStatus=='CLOSED'">
            <el-button @click="cancelOrder(status='Y')">同意免费取消</el-button>
            <el-button @click="cancelOrder(status='F')">同意收费取消</el-button>
            <el-button @click="cancelOrder(status='N')">不同意取消</el-button>
          </div>
          <span v-else>暂无申请</span>
        </el-form-item>
        <el-form-item label="退货申请" prop="timestamp" style="width: 100%;">
          {{ infoList.orderVO.refund=='F'?'无':'退货申请中' }}
          <el-button v-if="infoList.orderVO.refund=='T'" @click="refundOrder(status='Y')">同意退款</el-button>
          <el-button v-if="infoList.orderVO.refund=='T'" @click="refundOrder(status='N')">不同意退款</el-button>
        </el-form-item>
        <el-form-item v-if="infoList.orderVO.refund=='T'" label="退货原因：" prop="remark" style="width: 100%;">
          {{ infoList.orderVO.remark }}
        </el-form-item>
        <el-form-item v-if="infoList.orderVO.refund=='T'" label="退货图片" prop="timestamp" style="width: 100%;" />
        <el-form-item v-if="infoList.orderVO.refund=='T'" label="申请退货商品" prop="timestamp" style="width: 100%;">
          <el-image src="../" />
        </el-form-item>
        <el-form-item v-if="infoList.orderVO.refund=='T'" label="申请退货总金额" prop="timestamp" style="width: 100%;" />
        <el-form-item v-if="infoList.orderVO.refund=='T'" label="退货审批结果" prop="timestamp" style="width: 100%;" />
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          返回
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogLogisticsVisible">
      <timeline />
    </el-dialog>
    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, orderinfoList, importexcel, refundOrder, cancelOrder } from '@/api/order'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import UploadExcelComponent from '@/components/UploadExcel/index.vue'
import timeline from '@/views/profile/components/Timeline'
import axios from 'axios'

const calendarTypeOptions = [
  { key: 'CLOSED', display_name: '订单已取消' },
  { key: 'NOTPAY', display_name: '待支付' },
  { key: 'SUCCESS', display_name: '支付成功' },
  { key: 'YFH', display_name: '待发货' },
  { key: 'YSH', display_name: '待评价' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'Order',
  components: { Pagination, UploadExcelComponent, timeline },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      export: null,
      total: 0,
      loading: false,
      excelData: {
        header: null,
        results: null
      },
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        goodsName: undefined,
        orderNo: undefined,
        phyNum: undefined,
        orderStatus: undefined,
        orderTime: undefined,
        userName: undefined,
        phoneNo: undefined
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      infoList: {
        address: {
          city: undefined,
          district: undefined,
          province: undefined,
          address: undefined,
          name: undefined,
          phoneNo: undefined
        },
        orderGoods: [],
        orderVO: {
          nickname: undefined,
          phoneNo: undefined,
          orderNo: undefined,
          orderStatus: undefined,
          orderTime: undefined,
          payMoney: undefined,
          phyNum: undefined,
          refund: undefined,
          remark: undefined
        }
      },
      dialogFormVisible: false,
      dialogLogisticsVisible: false,
      dialogStatus: '',
      textMap: {
        update: '订单详情',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false,
      gridData: [{
        date: '2016-05-02',
        name: 'John Smith',
        price: '200',
        img: 'http://',
        num: '2'
      }, {
        date: '2016-05-04',
        name: 'John Smith',
        price: '200',
        img: 'http://',
        num: '1'
      }, {
        date: '2016-05-01',
        name: 'John Smith',
        price: '200',
        img: 'http://',
        num: '1'
      }]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    cancelOrder(e) {
      console.log(e)
      var canceldata = {
        status: e,
        orderNo: this.infoList.orderVO.orderNo
      }
      cancelOrder(canceldata).then(res => {
        console.log(res)
        if (e === 'Y' || e === 'F') {
          this.$message({
            message: '取消成功',
            type: 'success'
          })
        }
      })
    },
    refundOrder(e) {
      var refundData = {
        status: e,
        orderNo: this.infoList.orderVO.orderNo
      }
      refundOrder(refundData).then(res => {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
      })
    },
    handleLogistics() {
      this.dialogLogisticsVisible = true
    },
    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 1

      if (isLt1M) {
        return true
      }
      console.log(file)
      importexcel().then(res => {
        console.log(res)
      })
      this.$message({
        message: 'Please do not upload files larger than 1m in size.',
        type: 'warning'
      })
      return false
    },
    handleSuccess({ results }) {
      console.log(results)
      this.list = this.list.concat(results)
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.data
        this.total = response.data.count

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      console.log(this.listQuery)
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.infoList = {
        address: {
          city: undefined,
          district: undefined,
          province: undefined,
          address: undefined,
          name: undefined,
          phoneNo: undefined
        },
        orderGoods: [],
        orderVO: {
          nickname: undefined,
          phoneNo: undefined,
          orderNo: undefined,
          orderStatus: undefined,
          orderTime: undefined,
          payMoney: undefined,
          phyNum: undefined,
          refund: undefined,
          remark: undefined
        }
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      console.log(this.temp.orderNo)
      orderinfoList(this.temp.orderNo).then(res => {
        console.log(res)
        this.infoList = res.data
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
        }
      })
    },
    handleDelete(row, index) {
      this.$notify({
        title: 'Success',
        message: 'Delete Successfully',
        type: 'success',
        duration: 2000
      })
      this.list.splice(index, 1)
    },
    handleFetchPv(pv) {
    },
    handleDownload() {
      this.downloadLoading = true
      var exportdat = this.listQuery
      delete exportdat.page
      delete exportdat.limit
      console.log(exportdat)
      axios({
        method: 'get',
        url: process.env.VUE_APP_BASE_API + 'backstage-service/order/orderExportExcel',
        responseType: 'blob'
      }).then(response => {
        var blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        var url = window.URL.createObjectURL(blob)
        window.location.href = url
      })
      // exportExcel(exportdat).then(res => {
      //   console.log(res.data)
      //   this.export = res.data
      //   import('@/vendor/Export2Excel').then(excel => {
      //     const tHeader = ['商品名称', '订单ID', '物流ID', '订单状态', '订单价格', '用户手机', '用户id', '备注']
      //     const filterVal = ['goodsName', 'orderNo', 'phyNum', 'orderStatus', 'payMoney', 'phoneNo', 'userId', 'remark']
      //     const data = this.formatJson(filterVal)
      //     console.log(data)
      //     excel.export_json_to_excel({
      //       header: tHeader,
      //       data,
      //       filename: 'order-list'
      //     })
      //     this.downloadLoading = false
      //   })
      // })
    },
    formatJson(filterVal) {
      return this.export.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>

<style xml:lang="" scoped>
  .fixed-width .el-button--mini{
    width: auto;
  }
  .elform{
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: self-start;
    flex-wrap: wrap;
  }
  .el-form-item{
    margin-bottom: 5px;
  }
</style>

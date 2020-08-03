<template>
  <div class="app-container">
    <div class="filter-container">
      商品名称： <el-select v-model="listQuery.goodsId" style="width: 140px;margin-right: 10px;" class="filter-item" @change="handleFilter">
        <el-option v-for="item in goodsArr" :key="item.goodsId" :label="item.goodsName" :value="item.goodsId" />
      </el-select>
      状态：<el-select v-model="listQuery.releaseInd" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-delete" @click="handleDeleteBatch">
        批量删除
      </el-button>
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
      @selection-change="handleSelect"
    >
      <el-table-column type="selection" align="center" />
      <el-table-column label="分类名称" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.assermbleRuleId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名称id" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.goodsId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="2人团价格" min-width="150px" />
      <el-table-column label="5人团价格" width="110px" align="center">
        <template slot-scope="" />
      </el-table-column>
      <el-table-column label="商品价格" width="110px" align="center" />
      <el-table-column label="初始销量" width="110px" align="center" />
      <el-table-column label="创建时间" width="110px" align="center" />
      <el-table-column label="启用状态" width="80px">
        <template slot-scope="{row}">
          {{ row.releaseInd }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="success" size="mini" @click="handleModifyStatus(row,'draft')">
            下架
          </el-button>
          <!--          <el-button v-if="row.status=='deleted'" size="mini" type="success" @click="handleModifyStatus(row,'published')">-->
          <!--            启用-->
          <!--          </el-button>-->
          <el-button size="mini" type="primary" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="拼团商品" prop="release">
          <el-select v-model="temp.goodsId">
            <el-option v-for="item in goodsArr" :key="item.goodsId" :label="item.goodsName" :value="item.goodsId" />
          </el-select>
        </el-form-item>
        <el-form-item label="启用状态" prop="goods">
          <el-select v-model="temp.releaseInd" class="filter-item">
            <el-option v-for="item in releaseArr" :key="item.key" :label="item.name" :value="item.key" />
          </el-select>
        </el-form-item>
        <div class="block">
          <el-radio-group v-model="radio" @change="selectDiscounts">
            <el-radio :label="1">
              折扣
            </el-radio>
            <el-radio :label="2">
              金额
            </el-radio>
          </el-radio-group>
        </div>
        <div class="groupInput">
          <el-form-item label="成团人数">
            <el-input v-model="temp.persionAssermbleList[0].persionNum" />
          </el-form-item>
          <el-form-item label="优惠力度">
            <el-input v-model="temp.persionAssermbleList[0].discount" />折
          </el-form-item>
          <el-form-item label="">
            <el-input v-model="temp.persionAssermbleList[0].assermbleGoodsPrice" />元
          </el-form-item>
        </div>
        <div class="groupInput">
          <el-form-item label="成团人数">
            <el-input v-model="temp.persionAssermbleList[1].persionNum" />
          </el-form-item>
          <el-form-item label="优惠力度">
            <el-input v-model="temp.persionAssermbleList[1].discount" />折
          </el-form-item>
          <el-form-item label="">
            <el-input v-model="temp.persionAssermbleList[1].assermbleGoodsPrice" />元
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/group'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import { getgoodsNav } from '@/api/seckill'

// arr to obj, such as { CN : "China", US : "USA" }
// const releaseVal = releaseArr.reduce((acc, cur) => {
//   acc[cur.key] = cur.name
//   return acc
// }, {})
// const goodsVal = goodsArr.reduce((acc, cur) => {
//   acc[cur.key] = cur.name
//   return acc
// }, {})

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
    // typeFilter(type) {
    //   return releaseVal[type]
    // }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20
      },
      importanceOptions: [1, 2, 3],
      // calendarTypeOptions,
      releaseArr: [
        { key: 'T', name: '发布' },
        { key: 'F', name: '不发布' }
      ],
      goodsArr: [],
      goodsList: {
        position: 'SHOP'
      },
      image_uri: '',
      radio: 1,
      sortOptions: [{ label: '全部', key: 1 }, { label: '已启用', key: 2 }, { label: '未启用', key: 3 }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      selectId: [],
      temp: {
        goodsId: undefined,
        persionAssermbleList: [
          {
            persionNum: '',
            discount: '',
            assermbleGoodsPrice: ''
          },
          {
            persionNum: '',
            discount: '',
            assermbleGoodsPrice: ''
          }
        ],
        releaseInd: '',
        assermbleName: '拼团'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '拼团管理-编辑',
        create: '拼团管理-添加'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getgoodsNav()
    this.getList()
  },
  methods: {
    selectDiscounts(val) {
      console.log(val)
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
    getgoodsNav() {
      getgoodsNav(this.goodsList).then(response => {
        this.goodsArr = response.data
        console.log(response.data)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
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
      this.temp = {
        goodsId: undefined,
        persionAssermbleList: [
          {
            persionNum: '',
            discount: '',
            assermbleGoodsPrice: ''
          },
          {
            persionNum: '',
            discount: '',
            assermbleGoodsPrice: ''
          }
        ],
        releaseInd: '',
        assermbleName: '拼团'
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
        if (valid) {
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
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
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleSelect(index) {
      this.selectId = []
      for (var i = 0; i < index.length; i++) {
        this.selectId.push(index[i].id)
      }
      console.log(this.selectId)
    },
    handleDeleteBatch() {
      this.$notify({
        title: 'Success',
        message: '批量删除成功',
        type: 'success',
        duration: 2000
      })
      for (var i = this.selectId.length - 1; i >= 0; i--) {
        // console.log(this.selectId[i] - 1)
        this.list.splice(this.selectId[i] - 1, 1)
      }
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
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      // Just to simulate the time of the request
      setTimeout(() => {
        this.listLoading = false
      }, 1.5 * 1000)
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
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

<style lang="scss" scoped>
  /deep/ .groupInput{
    display: flex;
    .el-form-item{
      margin-right: 50px;
      .el-form-item__content {
        display: flex;
        color: #606266;
        font-weight: 700;
        .el-input__inner {
          width: 50px !important;
          margin-right: 10px;
        }
      }
    }
  }
  /deep/ .block{
    width: 400px;
    margin-left: 273px;
    margin-bottom: 6px;
    .el-radio{
      margin-right: 140px;
      font-weight: 700;
    }
  }
</style>

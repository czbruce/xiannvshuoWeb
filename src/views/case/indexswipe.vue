<template>
  <div class="app-container">
    <div class="filter-container">
      轮播图名称：<el-input v-model="listQuery.carouselName" style="width: 200px;margin-right: 10px;" class="filter-item" @keyup.enter.native="handleFilter" />
      状态：<el-select v-model="listQuery.releaseInd" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in releaseArr" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      类型：<el-select v-model="listQuery.position" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in typeOptions" :key="item.key" :label="item.name" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-delete" @click="handleDownload">
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
    >
      <el-table-column type="selection" align="center" />
      <el-table-column label="序号" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.upNo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="轮播图名称" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.carouselName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="图标" min-width="150px">
        <template slot-scope="{row}">
          <img :src="row.carouselPictrueUrl" style="width: 100px;height: 100px">
        </template>
      </el-table-column>
      <el-table-column label="轮播位置" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.position }}</span>
        </template>
      </el-table-column>
      <el-table-column label="关联商品" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.goodsName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="110px" align="center">
        <template slot-scope="{row}">
          <span style="">{{ row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="启用状态" width="80px">
        <template slot-scope="{row}">
          <span style="">{{ row.releaseInd }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button v-if="row.releaseInd=='T'" type="success" size="mini" @click="handleModifyStatus(row,F)">
            下架
          </el-button>
          <el-button v-if="row.releaseInd=='F'" size="mini" type="success" @click="handleModifyStatus(row,'T')">
            启用
          </el-button>
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
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="90px" style="width: 90%; margin-left:50px;">
        <el-form-item label="轮播图名称" prop="carouselName">
          <el-input v-model="temp.carouselName" />
        </el-form-item>
        <!--        <el-form-item label="轮播序号" prop="upNo">-->
        <!--          <el-input v-model="temp.upNo" />-->
        <!--        </el-form-item>-->
        <el-form-item label="是否发布" prop="release">
          <el-select v-model="temp.releaseInd">
            <el-option v-for="item in releaseArr" :key="item.key" :label="item.name" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="轮播位置" prop="release">
          <el-select v-model="temp.position">
            <el-option v-for="item in typeOptions" :key="item.key" :label="item.name" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联商品" prop="goods">
          <el-select v-model="temp.goodsId" class="filter-item">
            <el-option v-for="item in goodsArr" :key="item.goodsId" :label="item.goodsName" :value="item.goodsId" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述信息">
          <el-input v-model="temp.carouselUrl" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" />
        </el-form-item>
        <el-form-item label="轮播图">
          <div class="editor-container">
            <dropzone id="myVueDropzone" :default-img="'/'+ temp.goodsImageInfoUrlList" :max-files="maxfile" url="/small/backstage-service/upload/uploadImage" @dropzone-removedFile="dropzoneR" @dropzone-success="dropzoneS" />
          </div>
        </el-form-item>
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
import { fetchList, fetchPv, createArticle, updateArticle, getgoodsNav, deletelist } from '@/api/swiper'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import Dropzone from '@/components/Dropzone'

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
  name: 'Indexswipe',
  components: { Pagination, Dropzone },
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
      list: [],
      total: 0,
      maxfile: 1,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        carouselName: undefined,
        releaseInd: undefined,
        position: undefined
      },
      importanceOptions: [1, 2, 3],
      // calendarTypeOptions,
      releaseArr: [
        { key: 'T', name: '发布' },
        { key: 'F', name: '不发布' }
      ],
      typeOptions: [
        { key: 'HOME', name: '首页' },
        { key: 'FREE', name: '免费领' },
        { key: 'SKILL', name: '秒杀' },
        { key: 'SHOP', name: '商城' }
      ],
      img_url: '',
      goodsArr: [],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        carouselName: undefined,
        carouselOrder: 1,
        carouselPictrueUrl: '',
        carouselType: '',
        carouselUrl: '',
        position: '',
        releaseInd: '',
        upNo: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '轮播图-编辑',
        create: '轮播图-添加'
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
    this.getList()
    this.getgoodsNav()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.data
        this.total = response.data.count
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1 * 1000)
      })
    },
    getgoodsNav() {
      getgoodsNav(this.listQuery).then(response => {
        this.goodsArr = response.data.data
        console.log(this.goodsArr)
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
        carouselName: undefined,
        carouselOrder: 1,
        carouselPictrueUrl: '',
        carouselType: '',
        carouselUrl: '',
        position: '',
        releaseInd: '',
        goodsId: '',
        goodsName: '',
        upNo: ''
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
          var that = this
          this.temp.upNo = this.temp.goodsId
          createArticle(this.temp).then(() => {
            that.list.unshift(that.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '添加成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      // this.temp.timestamp = new Date(this.temp.timestamp)
      console.log(this.temp)
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
    handleDelete(row, index) {
      var carouselNo = {
        carouselNo: row.carouselNo
      }
      deletelist(carouselNo).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
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
                import('@/vendor/Export2Excel').then(excel => {
                  const tHeader = ['timestamp', 'title', 'gettype.js', 'importance', 'status']
                  const filterVal = ['timestamp', 'title', 'gettype.js', 'importance', 'status']
                  const data = this.formatJson(filterVal)
                  excel.export_json_to_excel({
                    header: tHeader,
                    data,
                    filename: 'table-list'
                  })
                  this.downloadLoading = false
                })
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
    },
    dropzoneS(file) {
      console.log(file.xhr)
      this.$message({ message: '上传成功', type: 'success' })
      var imgurl = file.xhr.response
      console.log(JSON.parse(imgurl))
      this.temp.carouselPictrueUrl = JSON.parse(imgurl).data
      console.log(this.temp)
    },
    dropzoneR(file) {
      console.log(file)
      this.$message({ message: '删除成功', type: 'success' })
    }
  }
}
</script>

<style lang="scss" scoped>
  /deep/ .editor-container {
    .dz-image{
      width: 120px !important;
      height: 120px !important;
      img{
        width: 120px !important;
        height: 120px !important;
      }
    }
  }
</style>

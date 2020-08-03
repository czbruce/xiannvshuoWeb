<template>
  <div class="app-container">
    <div class="filter-container">
      分类名称：
      <el-select v-model="listQuery.goodsArr" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in goodsArr" :key="item.key" :label="item.name" :value="item.key" />
      </el-select>
      商品名称：<el-input v-model="listQuery.goodsName" style="width: 200px;margin-right: 10px;" class="filter-item" @keyup.enter.native="handleFilter" />
      状态：<el-select v-model="listQuery.releaseInd" style="width: 140px;margin-right: 10px;" class="filter-item" @change="handleFilter">
        <el-option v-for="item in releaseArr" :key="item.key" :label="item.name" :value="item.key" />
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
      <el-table-column label="商品ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.goodsId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分类名称" min-width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.goodsCategoryName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" width="280px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.goodsName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品价格" min-width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.goodsPriceS }}</span>
        </template>
      </el-table-column>
      <el-table-column label="划线价" min-width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.goodsLinePriceS }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="showReviewer" label="创建时间" min-width="110px" align="center">
        <template slot-scope="{row}">
          <span style="color:red;">{{ row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="启用状态" min-width="80px">
        <template slot-scope="{row}">
          {{ row.releaseInd=='T'? '已启用' : '未启用' }}
        </template>
      </el-table-column>
      <el-table-column label="是否热门" min-width="80px">
        <template slot-scope="{row}">
          {{ row.hotInd=='T'? '是' : '否' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button v-if="row.releaseInd=='T'" type="success" size="mini" @click="handleModifyStatus(row,'F')">
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
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 90%; margin-left:50px;" class="elform">
        <el-form-item v-show="dialogStatus==='create'? true : false " label="商品编码" prop="name" style="width: 50%; margin-right: 5%">
          <el-input v-model="temp.goodsNo" />
        </el-form-item>
        <el-form-item label="商品名称" prop="name" style="width: 45%; margin-right: 0%">
          <el-input v-model="temp.goodsName" />
        </el-form-item>
        <el-form-item label="商品分类" prop="release" style="width: 50%; margin-right: 5%">
          <el-select v-model="temp.goodsCategoryId">
            <el-option v-for="item in goodsArr" :key="item.goodsCategoryId" :label="item.goodsCategoryName" :value="item.goodsCategoryId" />
          </el-select>
        </el-form-item>
        <el-form-item v-show="false" label="商品分类" prop="release" style="width: 50%; margin-right: 5%">
          <el-select v-model="temp.goodsCategoryId">
            <el-option v-for="item in goodsArr" :key="item.goodsCategoryId" :label="item.goodsCategoryName" :value="item.goodsCategoryId" />
          </el-select>
        </el-form-item>
        <el-form-item label="划线价" prop="id" style="width: 45%; margin-right: 0%">
          <el-input v-model="temp.goodsLinePriceS" />
        </el-form-item>
        <el-form-item label="商品价格" prop="id" style="width: 50%; margin-right: 5%">
          <el-input v-model="temp.goodsPriceS" />
        </el-form-item>
        <el-form-item label="初始销量" prop="id" style="width: 45%; margin-right: 0%">
          <el-input v-model="temp.initalSales" />
        </el-form-item>
        <el-form-item label="是否热门" prop="release" style="width: 50%;  margin-right: 5%">
          <el-select v-model="temp.hotInd">
            <el-option v-for="item in hotIndArr" :key="item.key" :label="item.name" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否发布" prop="release" style="width: 45%;">
          <el-select v-model="temp.releaseInd">
            <el-option v-for="item in releaseArr" :key="item.key" :label="item.name" :value="item.key" />
          </el-select>
        </el-form-item>

        <el-form-item label="商品简介" style="width: 100%;">
          <el-input v-model="temp.goodsDescribe" :autosize="{ minRows: 4, maxRows: 6}" type="textarea" />
        </el-form-item>
        <el-form-item label="商品图" style="width: 100%;">
          <div class="editor-container">
            <el-upload
              action="/small/backstage-service/upload/uploadImage"
              list-type="picture-card"
              :show-file-list="true"
              :on-preview="handlePictureCardPreview"
              :on-success="imghandsuccess"
              :file-list="fileList"
              :on-remove="handleRemoveimg"
            >
              <i class="el-icon-plus" />
            </el-upload>
            <el-dialog :visible.sync="dialogVisible">
              <img width="100%" :src="temp.goodsImageUrlList" alt="">
            </el-dialog>
            <!--            <dropzone id="myVueDropzone1" :default-img="'/'+ temp.goodsImageUrlList" :max-files="maxFiles-7" url="/small/backstage-service/upload/uploadImage" @dropzone-removedFile="dropzoneR" @dropzone-success="dropzoneS" />-->
          </div>
        </el-form-item>
        <el-form-item label="商品详情图" style="width: 100%;">
          <div class="editor-container">
            <!--            <dropzone id="myVueDropzone2" :default-img="'/'+ temp.goodsImageInfoUrlList" :max-files="maxFiles" url="/small/backstage-service/upload/uploadImage" @dropzone-removedFile="dropzoneRinfo" @dropzone-success="dropzoneSinfo" />-->
            <div class="editor-container">
              <el-upload
                action="/small/backstage-service/upload/uploadImage"
                list-type="picture-card"
                :show-file-list="true"
                :on-preview="handlePicturePreview"
                :on-success="imginfohandsuccess"
                :file-list="fileinfoList"
                :on-remove="handleRemove"
              >
                <i class="el-icon-plus" />
              </el-upload>
              <el-dialog :visible.sync="dialogVisible">
                <img width="100%" :src="temp.goodsImageInfoUrlList" alt="">
              </el-dialog>
            </div>
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
import { fetchList, fetchPv, createArticle, updateArticle, deleteNav, getgoodsNav, handdelete } from '@/api/goods'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
// import Dropzone from '@/components/Dropzone'
import Pagination from '@/components/Pagination'

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
      fileList: [],
      fileinfoList: [],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        goodsName: undefined,
        goodsCategoryId: undefined,
        releaseInd: undefined
      },
      maxFiles: 10,
      selectId: [],
      importanceOptions: [1, 2, 3],
      // calendarTypeOptions,
      releaseArr: [
        { key: 'T', name: '发布' },
        { key: 'F', name: '不发布' }
      ],
      hotIndArr: [
        { key: 'T', name: '是' },
        { key: 'F', name: '否' }
      ],
      goodsArr: [
      ],
      image_uri: '',
      sortOptions: [{ label: '全部', key: 1 }, { label: '已启用', key: 2 }, { label: '未启用', key: 3 }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        goodsName: '',
        deleteInd: '',
        goodsCategoryId: '',
        goodsCategoryName: '',
        goodsDescribe: '',
        goodsImageInfoUrlList: [],
        goodsImageUrlList: [],
        goodsLinePriceS: '',
        goodsPriceS: '',
        hotInd: '',
        initalSales: 0,
        releaseInd: ''
      },
      dialogFormVisible: false,
      dialogImageUrl: '',
      dialogVisible: false,
      dialogStatus: '',
      showFileList: true,
      textMap: {
        update: '商品管理-编辑',
        create: '商品管理-添加'
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
        }, 1.5 * 1000)
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
      fetchPv(row.goodsId).then(() => {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        row.releaseInd = status
      })
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
        goodsName: '',
        deleteInd: '',
        goodsCategoryId: '',
        goodsCategoryName: '',
        goodsDescribe: '',
        goodsImageInfoUrlList: [],
        goodsImageUrlList: [],
        goodsLinePriceS: '',
        goodsPriceS: '',
        hotInd: '',
        initalSales: 0,
        releaseInd: ''
      }
    },
    handleCreate() {
      this.fileList = []
      this.fileinfoList = []
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
          this.goodsImageInfoUrlList = this.fileinfoList
          this.goodsImageUrlList = this.fileList
          this.temp.goodsCategoryName = this.goodsArr[0].goodsCategoryName
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
    handleSelect(index) {
      console.log(index)
      this.selectId = []
      for (var i = 0; i < index.length; i++) {
        this.selectId.push(index[i].goodsId)
      }
      console.log(this.selectId)
    },
    handleDeleteBatch() {
      handdelete(this.selectId).then(() => {
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
      })
    },
    handleUpdate(row) {
      this.fileList = []
      this.fileinfoList = []
      this.temp = Object.assign({}, row) // copy obj
      console.log(this.temp)
      this.temp.goodsId = row.goodsId
      // this.fileList = this.temp.goodsImageUrlList
      this.temp.goodsImageUrlList.map(res => {
        console.log(res)
        var listda = {}
        listda.url = res
        this.fileList.push(listda)
      })
      this.temp.goodsImageInfoUrlList.map(res => {
        console.log(res)
        var listinfoda = {}
        listinfoda.url = res
        this.fileinfoList.push(listinfoda)
      })
      console.log(this.fileList)
      delete this.temp.goodsNo
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
          this.goodsImageInfoUrlList = this.fileinfoList
          this.goodsImageUrlList = this.fileList
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
      deleteNav(row.goodsId).then(() => {
        this.$notify({
          title: 'Success',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
        this.list.splice(index, 1)
      })
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
    handleRemoveimg(file, fileList) {
      console.log('删除')
      console.log(file, fileList)
      var infourl = []
      fileList && fileList.map(res => {
        infourl.push(res.url)
      })
      this.temp.goodsImageUrlList = infourl
      console.log(this.temp.goodsImageUrlList)
    },
    handleRemove(file, fileList) {
      console.log('删除')
      console.log(file, fileList)
      var infourl = []
      fileList && fileList.map(res => {
        infourl.push(res.url)
      })
      this.temp.goodsImageInfoUrlList = infourl
      console.log(this.temp.goodsImageInfoUrlList)
    },
    handlePictureCardPreview(file) {
      console.log('file')
      console.log(file)
      this.temp.goodsImageUrlList = file.url
      this.dialogVisible = true
    },
    imghandsuccess(e) {
      console.log('imghandsuccess')
      console.log(e)
      this.temp.goodsImageUrlList.push(e.data)
    },
    handlePicturePreview(file) {
      console.log(file)
      this.temp.goodsImageInfoUrlList = file.url
      this.dialogVisible = true
    },
    imginfohandsuccess(e) {
      console.log(e)
      this.temp.goodsImageInfoUrlList.push(e.data)
      console.log(this.temp.goodsImageInfoUrlList)
    },
    dropzoneS(file) {
      console.log(file.xhr)
      this.$message({ message: '上传成功', type: 'success' })
      var imgurl = file.xhr.response
      console.log(JSON.parse(imgurl))
      this.temp.goodsImageUrlList.push(JSON.parse(imgurl).data)
      console.log(this.temp)
    },
    dropzoneR(file) {
      console.log(file)
      this.$message({ message: '删除成功', type: 'success' })
    },
    dropzoneSinfo(file) {
      console.log(file.xhr)
      this.$message({ message: '上传成功', type: 'success' })
      var imgurlS = file.xhr.response
      console.log(JSON.parse(imgurlS))
      this.temp.goodsImageInfoUrlList.push(JSON.parse(imgurlS).data)
      console.log(this.temp)
    },
    dropzoneRinfo(file) {
      console.log(file)
      var imgurlS = file.xhr.response
      console.log(JSON.parse(imgurlS))
      this.temp.goodsImageInfoUrlList.splice(JSON.parse(imgurlS).data)
      this.$message({ message: '删除成功', type: 'success' })
    }
  }
}
</script>

<style xml:lang="scss" scoped>
  .elform{
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: self-start;
    flex-wrap: wrap;
  }
  .el-form-item{
    margin-bottom: 15px;
  }
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>

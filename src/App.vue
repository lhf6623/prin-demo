<script setup lang="tsx">
import { ref, reactive } from "vue";
import {
  textToBase64Barcode,
  printHtml,
  StateOptions,
  useGetList,
} from "./utils";
import { SettingPanel } from "./components/com";
import { useStorage } from "@vueuse/core";
import pck from "../package.json";
const store_key = (k: string) =>
  `${pck.name}_${pck.version}_${k}`.toLocaleUpperCase();

const imgRef = ref("");
const imgObj = reactive({
  code: "",
  numCode: "",
});
const formData = reactive({
  code: "",
  numCode: "",
  sp: {
    min: undefined,
    max: undefined,
  },
});

const state = useStorage<StateOptions>(store_key("p"), {
  width: 2,
  height: 100,
  marginTop: 10,
  marginBottom: 10,
  marginLeft: 10,
  marginRight: 10,
  fontSize: 20,
  imgWidth: 300,
});
const urlState = useStorage(store_key("u"), {
  url: "",
  isUrl: false,
});
// http://192.168.3.121:8855/uuid.html
const { load, getList, allArr, filterateArr, num } = useGetList(
  urlState,
  state
);

function createBase64() {
  const { code, numCode } = imgObj;
  if (!code) {
    alert("请输入编码");
    return;
  }
  imgRef.value = textToBase64Barcode(code, numCode, state.value);
}
function clean() {
  imgRef.value = "";
}

function showCode() {
  urlState.value.isUrl = !urlState.value.isUrl;
  filterateArr.value = [];

  allArr.value = [];
  load.value = "请点击 '生成条形码' 按钮";
  if (urlState.value.isUrl && urlState.value.url) {
    getList();
  }
}

function printHtmlFn(bse64: string) {
  printHtml(bse64, state.value);
}

function filterateList() {
  const { sp, code, numCode } = formData;
  const { min, max } = sp;
  filterateArr.value = allArr.value.filter((item, index) => {
    if (code) {
      return item.code.includes(code);
    }
    if (numCode) {
      return item.key.includes(numCode);
    }
    if (min && min != undefined && max && max != undefined) {
      return index <= max && index >= min;
    }
    return true;
  });
}
</script>

<template>
  <div v-if="!urlState.isUrl" class="flex justify-center items-center h-full">
    <p>
      <label for="url" class="mr-2">IP地址</label>
      <input
        name="url"
        class="border-1px p-1 px-4 w-200px"
        type="text"
        v-model="urlState.url"
        placeholder="192.168.3.121"
      />
      <button @click="showCode" class="border-1px p-1 px-4 ml-1">确认</button>
    </p>
  </div>
  <div v-else class="flex p-1 box-border h-full">
    <div class="p-1 border-1px mr-1">
      <h2 class="text-center mb-2">
        配置
        <span class="text-red-400 text-xs">会在本地记录</span>
      </h2>
      <component :is="SettingPanel(state)" />
      <p class="text-center m-2">
        <button class="border-1px py-1 px-2 mr-2" @click="showCode">
          回首页
        </button>
        <button class="border-1px py-1 px-2 bg-blue-500" @click="getList">
          生成条形码
        </button>
      </p>

      <div class="border-1px p-1">
        <div class="flex justify-between items-center mb-2">
          <h2>自定义生成二维码</h2>
          <div>
            <button class="border-1px px-2 bg-blue-500" @click="createBase64">
              生成
            </button>
            <button
              class="border-1px px-2 bg-blue-500"
              v-if="imgRef"
              @click="printHtmlFn(imgRef)"
            >
              打印
            </button>
            <button
              class="border-1px px-2 bg-blue-500"
              v-if="imgRef"
              @click="clean"
            >
              清除
            </button>
          </div>
        </div>
        <p class="mb-1">
          <label for="num" class="mr-2">编号</label>
          <input class="border-1px" type="text" v-model="imgObj.numCode" />
        </p>
        <p class="mb-1">
          <label for="num" class="mr-2">编码</label>
          <input class="border-1px" type="text" v-model="imgObj.code" />
        </p>
        <img :src="imgRef" />
      </div>
    </div>
    <div class="p-2 border-1px box-content flex flex-1 flex-col">
      <!-- 查询条件 -->
      <div class="mb-2" v-if="allArr.length">
        <div class="flex mb-1">
          <p>
            <label for="code" class="mr-1">编码</label>
            <input
              v-model="formData.code"
              name="code"
              class="border-1px"
              type="text"
            />
          </p>
          <p class="mx-2">
            <label for="numCode" class="mr-1">序号</label>
            <input
              v-model="formData.numCode"
              name="numCode"
              class="border-1px"
              type="text"
            />
          </p>
          <p>
            <label class="mr-1">区间查找</label>
            <input
              v-model="formData.sp.min"
              class="border-1px w-100px"
              type="text"
            />
            <span>~</span>
            <input
              v-model="formData.sp.max"
              class="border-1px w-100px"
              type="text"
            />
            <button class="border-1px px-2 mx-2 ml-1" @click="filterateList">
              搜索（{{ allArr.length }}）
            </button>
            <button
              class="border-1px px-2 ml-1 bg-red-400"
              @click="getList"
              v-if="num != allArr.length"
            >
              当前有更新数据，点击更新
            </button>
          </p>
        </div>
      </div>
      <div class="bg-dark-50 text-light-50 h-full overflow-auto flex-1">
        <div v-if="allArr.length" class="flex flex-wrap">
          <div v-for="(item, index) in allArr" :key="index" class="flex p-2">
            <div>
              <img width="480" :src="item.base64" :alt="item.key" />
              <p>{{ item.all_content }}</p>
            </div>
            <div class="flex justify-center items-center ml-2">
              <button class="border-1px px-2" @click="printHtmlFn(item.base64)">
                打印
              </button>
            </div>
          </div>
        </div>
        <div v-else class="text-center flex h-full justify-center items-center">
          <span>
            {{ load }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
html,
body,
#app {
  height: 100%;
  overflow: hidden;
  position: relative;
}
</style>

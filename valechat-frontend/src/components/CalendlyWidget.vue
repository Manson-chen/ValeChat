<template>
  <div>
    <!-- eslint-disable-next-line -->
    <el-dialog :visible.sync="dialogOpen" width="50%" :before-close="handleClose">
      <div v-if="dialogOpen">
            <vue-calendly :height="600"
                :url="calendlyUrl"
            >
            </vue-calendly>
      </div>
    </el-dialog>
  </div>
</template>

<script>

export default {
  props: {
    dialogOpen: {
      type: Boolean,
      default: false,
    },
    calendlyUrl: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
    };
  },
  methods: {
    handleClose() {
      this.$emit("update:dialogOpen", false);
    },
  },
};
</script>

<style lang="scss" scoped></style>

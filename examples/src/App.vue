<template>
  <div id="app">
    <div id="nav">
      <router-link to="/quickTable">quickTable</router-link>
      <br />
      <router-link to="/quickForm">quickForm</router-link>
      <router-link to="/quickForm/tableQuery">tableQuery</router-link>
      <router-link to="/quickForm/quickCreate">quickCreate</router-link>
      <router-link to="/quickForm/quickCreatePreview"
        >quickCreatePreview</router-link
      >
    </div>
    <router-view />
  </div>
</template>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 15px;

  a {
    font-weight: bold;
    color: #2c3e50;
    margin-right: 10px;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>

const NodeHelper = require("node_helper");
const exec = require("child_process").exec;
const Log = require("../../js/logger");

module.exports = NodeHelper.create({
  /**
   *
   */
  start: function () {
    this.isMonitorOn(function (result) {
      Log.info("MMM-MotionDetector: monitor is " + (result ? "ON" : "OFF") + ".");
    });
  },

  /**
   *
   */
  activateMonitor: function () {
    this.isMonitorOn(function (result) {
      if (!result) {
        exec("caffeinate -u -t 1", function (err, out, code) {
          if (err) {
            Log.error("MMM-MotionDetector: error activating monitor: " + code);
          } else {
            Log.info("MMM-MotionDetector: monitor has been activated.");
          }
        });
      }
    });
  },

  /**
   *
   */
  deactivateMonitor: function () {
    this.isMonitorOn(function (result) {
      if (result) {
        exec("pmset displaysleepnow", function (err, out, code) {
          if (err) {
            Log.error("MMM-MotionDetector: error deactivating monitor: " + code);
          } else {
            Log.info("MMM-MotionDetector: monitor has been deactivated.");
          }
        });
      }
    });
  },

  /**
   *
   * @param resultCallback
   */
  isMonitorOn: function (resultCallback) {
    exec("pmset -g powerstate IODisplayWrangler | tail -1 | cut -c29", function (err, out, code) {
      if (err) {
        Log.error("MMM-MotionDetector: error calling monitor status: " + code);
        return;
      }

      Log.info("MMM-MotionDetector: monitor status is " + out);
      resultCallback(out.includes("4"));
    });
  },

  /**
   *
   * @param notification
   * @param payload
   */
  socketNotificationReceived: function (notification, payload) {
    if (notification === "ACTIVATE_MONITOR") {
      Log.info("MMM-MotionDetector: activating monitor.");
      this.activateMonitor();
    }
    if (notification === "DEACTIVATE_MONITOR") {
      Log.info("MMM-MotionDetector: deactivating monitor.");
      this.deactivateMonitor();
    }
  },
});

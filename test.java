package org.me.leo_s.main.manager;

import org.bukkit.scheduler.BukkitScheduler;

import com.sk89q.worldedit.extent.clipboard.Clipboard;
import org.me.leo_s.main.main;

import static org.bukkit.Bukkit.getServer;

import org.bukkit.Bukkit;

public class threadArena extends Thread {
  int taskID;
  main plugin;

  public threadArena(main plugin) {
    this.plugin = plugin;
  }

  int time;

  public void reparingArena(Clipboard clipsize) {
    for (int i = 0; i < clipsize.getDimensions().getBlockY(); i++) {
      createYThread(clipsize, i);
    }
  }

  private void createYThread(Clipboard clipsize, int threadNumber) {

    time = 0;

    for (int j = 0; j < clipsize.getDimensions().getBlockX(); j++) {
      for (int k = 0; k < clipsize.getDimensions().getBlockZ(); k++) {
        BukkitScheduler scheduler = getServer().getScheduler();
        taskID = scheduler.scheduleSyncRepeatingTask(plugin, () -> {
          System
          if (time <= 0) {
            Bukkit.getScheduler().cancelTask(taskID);
          }
          time--;
        }, 0L, 20L);
      }
    }

    thread.start();
  }
}
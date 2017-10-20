# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "bento/ubuntu-16.04"
  config.vm.network "private_network", ip: "192.168.101.21"

  config.vm.provider "virtualbox" do |vb|
    vb.customize ["modifyvm", :id, "--memory", "1024", "--cpus", "2", "--ioapic", "on", "--natdnshostresolver1", "on"]
    vb.customize ["setextradata", :id, "VBoxInternal/Devices/VMMDev/0/Config/GetHostTimeDisabled", 0]
  end

  config.vm.synced_folder "./",
    "/minixer",
    type: "nfs",
    mount_options: ["async", "nolock", "nfsvers=3", "vers=3", "tcp", "noatime", "soft", "rsize=8192", "wsize=8192"]

  config.vm.provision :chef_solo do |chef|
    chef.cookbooks_path = "chef-cookbooks"
    chef.run_list = [
      "recipe[redis]",
      "recipe[memcached]",
      "recipe[node]",
      "recipe[php71]",
      "recipe[apache2]",
    ]
  end
end

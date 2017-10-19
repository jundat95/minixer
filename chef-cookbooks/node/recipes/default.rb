NODE_VERSION='8.6.0'

package 'nodejs' do
  action :install
  not_if "which n"
end
package 'npm' do
  action :install
  not_if "which n"
end

bash "install n package & latest npm" do
  code <<-EOS
  npm cache clean
  npm install -g n

  n #{NODE_VERSION}
  EOS
  not_if "which n"
end

package 'nodejs' do
  action :purge
end
package 'npm' do
  action :purge
end

bash "install pm2" do
  code <<-EOS
  npm install -g pm2
  EOS
end

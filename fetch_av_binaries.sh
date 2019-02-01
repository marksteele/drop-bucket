mkdir -p clamav

echo "-- Downloading AmazonLinux container --"
docker pull amazonlinux
docker create -i -t -v ${PWD}/clamav:/home/docker  --name s3-antivirus-builder amazonlinux
docker start s3-antivirus-builder

echo "-- Updating, downloading and unpacking clamAV and ClamAV update --"
docker exec -it -w /home/docker s3-antivirus-builder yum install -y cpio yum-utils libtool-ltdl
docker exec -it -w /home/docker s3-antivirus-builder yum install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
docker exec -it -w /home/docker s3-antivirus-builder yum-config-manager --enable epel
docker exec -it -w /home/docker s3-antivirus-builder yumdownloader -x \*i686 --archlist=x86_64 clamav clamav-lib clamav-update json-c pcre2 libtool-ltdl
docker exec -it -w /home/docker s3-antivirus-builder /bin/sh -c "echo 'folder content' && ls -la"
docker exec -it -w /home/docker s3-antivirus-builder /bin/sh -c "rpm2cpio clamav-0*.rpm | cpio -idmv"
docker exec -it -w /home/docker s3-antivirus-builder /bin/sh -c "rpm2cpio clamav-lib*.rpm | cpio -idmv"
docker exec -it -w /home/docker s3-antivirus-builder /bin/sh -c "rpm2cpio clamav-update*.rpm | cpio -idmv"
docker exec -it -w /home/docker s3-antivirus-builder /bin/sh -c "rpm2cpio json-c*.rpm | cpio -idmv"
docker exec -it -w /home/docker s3-antivirus-builder /bin/sh -c "rpm2cpio pcre2*.rpm | cpio -idmv"
docker exec -it -w /home/docker s3-antivirus-builder /bin/sh -c "rpm2cpio libtool-ltdl*.rpm | cpio -idmv"

docker stop s3-antivirus-builder
docker rm s3-antivirus-builder

mkdir -p av/bin

echo "-- Copying the executables and required libraries --"
cp -av clamav/usr/bin/clamscan clamav/usr/bin/freshclam clamav/usr/lib64/* av/bin/.
rm -rf clamav

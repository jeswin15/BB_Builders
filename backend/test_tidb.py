import pymysql

try:
    conn = pymysql.connect(
        host="gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com",
        port=4000,
        user="3e3vM2fEpj5GyGA.root",
        password="aUtMqMdJKA2tKIpU",
        database="sys",
        ssl={"ssl": True}
    )
    print("PyMySQL Connected successfully!")
    conn.close()
except Exception as e:
    print(f"PyMySQL Error: {e}")

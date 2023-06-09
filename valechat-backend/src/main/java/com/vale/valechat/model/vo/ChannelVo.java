package com.vale.valechat.model.vo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

@Data
public class ChannelVo implements Serializable {
    private static final long serialVersionUID = 2665453366904905813L;
    @TableId(type = IdType.AUTO)
    private Long id;

    private String channelName;

    private Long masterId;

    private Date updateTime;
}
